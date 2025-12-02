import Gio from "gi://Gio?version=2.0";
import Gst from "gi://Gst?version=1.0";
import Gly from "gi://Gly?version=2";
import GstPbutils from "gi://GstPbutils?version=1.0";
import { Song } from "./song";
import { Plugin } from "../plugin";
import { Artist } from "./artist";
import { Vibe } from "..";
import { Album } from "./album";
import GLib from "gi://GLib?version=2.0";


// This is still heavily WIP

/** retrieve metadata from media files, and apply them to a vibe object */
export abstract class Meta {

    /** get metadata tags(GstTags) from a media file 
      * @param file the GFile/path of the media where to get the data from
      * @param separator optional metadata separator. by default it's a comma: ','
      * @param timeout optionally specify a timeout for GstPbutilsDiscoverer to work with(nanoseconds)
      *
      * @returns a {@link Meta.Data} object, containing the meta tags from the file(can be empty if there's none) */
    public static getMetaTags(file: string|Gio.File, separator: string = ',', timeout: number = 2500000000): Meta.Data {
        file = typeof file === "string" ?
            Gio.File.new_for_path(file)
        : file;

        if(!file.query_exists(null))
            throw new Meta.MetaReadError("File either doesn't exist or isn't accessible");

        if(!Gst.is_initialized())
            Gst.init([]);

        GstPbutils.pb_utils_init();

        const discoverer = GstPbutils.Discoverer.new(timeout);
        const info = discoverer.discover_uri(`file://${file.peek_path()}`);
        const result = info.get_result();

        switch(result) {
            case GstPbutils.DiscovererResult.ERROR:
                throw new Meta.MetaReadError("An unkown error occurred on GstPbutilsDiscoverer");

            case GstPbutils.DiscovererResult.MISSING_PLUGINS:
                throw new Meta.MetaMissingPluginsError(info.get_missing_elements_installer_details());
            
            case GstPbutils.DiscovererResult.URI_INVALID:
                throw new Meta.MetaReadError("Invalid URI for file");

            case GstPbutils.DiscovererResult.TIMEOUT:
                throw new Meta.MetaTimeoutError();
        }

        const tags = info.get_audio_streams()[0]?.get_tags();
        if(!tags)
            return {}; // no tags

        return this.taglistToData(tags, separator);
    }

    public static async getMetaTagsAsync(file: string|Gio.File, separator: string = ',', timeout: number = 2500000000): Promise<Meta.Data> {
        return this.getMetaTags(file, separator, timeout);
    }

    /** applies metadata to `Song` objects. properties like `:title`, `:artist` and `:metadata` are set
      * automatically by this function, if found in `data`.
      *
      * the `plugin` parameter is used to search for existing objects declared by the plugin. it
      * avoids creating unnecessary new objects.
      *
      * @throws `Error` if the `pictureData` property of `data` is corrupted and couldn't be read
      * 
      * @param song the `Song` object to apply metadata 
      * @param data the `Meta.Data` object containing the metadata
      * @param plugin optional `Plugin` object that is calling this method
      * @param options optional modifiers that enables specific method features */
    public static applyTags(song: Song, data: Meta.Data, plugin?: Plugin, options: {
        /** whether to apply any image/picture to the song using the metadata.
          * @default true */
        applyImage?: boolean;
        /** whether to, if `applyImage` is true, use an asynchronous(non-blocking) way to load the image.
          * @default true */
        applyImageAsynchronously?: boolean;
        /** whether to apply the same song picture/image to the artist.
          * @default true */
        applyImageToArtist?: boolean;
    } = {}): void {
        if(Object.keys(data).length < 1)
            return;

        options.applyImage ??= true;
        options.applyImageAsynchronously ??= true;
        options.applyImageToArtist ??= true;

        song.metadata = data;

        const encode = new TextEncoder().encode;

        if(data.title !== undefined)
            song.title = data.title;

        if(data.explicit !== undefined)
            song.explicit = data.explicit;

        if(data.artists !== undefined && data.artists.length > 0) {
            const artists: Array<Artist> = [];

            for(const name of data.artists) {
                if(plugin) {
                    const foundArtistData = Vibe.getDefault().artists.find(d => 
                        d.plugin === plugin && d.artist.name === name
                    );

                    if(foundArtistData) {
                        artists.push(foundArtistData.artist);
                        continue;
                    }
                }

                artists.push(new Artist({
                    name,
                    plugin
                }));
            }

            song.artist = artists;
        }

        // FIXME: use metadata :albumArtist for setting album artists instead of grabbing from song
        if(data.albumName !== undefined) {
            if(plugin) {
                const foundAlbum = Vibe.getDefault().albums.find((d) => {
                    if(d.plugin !== plugin)
                        return;

                    if(d.album.title !== data.albumName)
                        return;

                    const foundArtist = d.album.artist.find(a => {
                        for(const artist of song.artist) 
                            return artist.id === a.id;
                    });

                    return Boolean(foundArtist);
                });

                if(foundAlbum)
                    song.album = foundAlbum.album;

                // add song if not in the album already
                if(!foundAlbum?.album.songs.find(s => s.id === song.id))
                    foundAlbum?.album.add(song);
            } else {
                song.album = new Album({
                    title: data.albumName,
                    artist: song.artist,
                    plugin
                });

                if(!song.album.songs.find(s => s.id === song.id))
                    song.album.add(song);
            }
        }

        // load song image/picture
        try {
            const obj = song.album ?? song;
            if(data.pictureData !== undefined && options.applyImage && options.applyImageAsynchronously) {
                const loader = Gly.Loader.new_for_bytes(GLib.base64_decode(data.pictureData));
                loader.load_async(null, (_, res) => {
                    try {
                        const image = loader.load_finish(res);
                        obj.image = image;

                        if(!options.applyImageToArtist)
                            return;

                        for(const artist of obj.artist) {
                            if(artist.image)
                                continue;

                            artist.image = obj.image;
                        }
                    } catch(e) {
                        console.error("An error occurred while asynchronously-loading image from song metadata", e);
                        return;
                    }
                });
            } else if(data.pictureData !== undefined && options.applyImage) {
                const image = Gly.Loader.new_for_bytes(GLib.base64_decode(data.pictureData)).load();
                obj.image = image;

                if(options.applyImageToArtist) {
                    for(const artist of obj.artist) {
                        if(artist.image)
                            continue;

                        artist.image = obj.image;
                    }
                }
            }
        } catch(e) {
            console.error("Couldn't load image for artist while applying metadata tags", e);
        }
    }

    /** convert a `GstTagList` to a `Meta.Data` object. 
      * 
      * @param taglist the `GstTagList` you want to convert
      * @param separator an optional metadata separator. the default is a comma: ',' 
      *
      * @returns a `Meta.Data` object with the result of the convertion */
    public static taglistToData(taglist: Gst.TagList, separator: string = ','): Meta.Data {
        const data: Meta.Data = {};

        taglist.foreach((self, tag) => {
            switch(tag.toLowerCase().replaceAll(' ', '')) {
                case "title":
                    data.title = self.get_string(tag)[1];
                break;

                case "artist":
                    data.artists = self.get_string(tag)[1]?.split(separator).filter(s => s.trim() !== "");
                break;

                case "albumartist":
                    data.albumArtists = self.get_string(tag)[1]?.split(separator).filter(s => s.trim() !== "");
                break;

                case "album":
                    data.albumName = self.get_string(tag)[1];
                break;

                case "image":
                case "album-cover":
                case "picture":
                    data.pictureData = self.get_string(tag)[1];
                break;

                case "discnumber":
                    data.discNumber = self.get_int(tag)[1];
                break;

                case "tracknumber":
                    data.trackNumber = self.get_int(tag)[1];
                break;

                case "tracktotal":
                    data.trackTotal = self.get_int(tag)[1];
                break;

                case "barcode":
                case "upc":
                    data.barcode = self.get_int(tag)[1];
                break;

                case "explicit":
                    data.explicit = self.get_int(tag)[1] !== 0;
                break;

                case "composer":
                    data.composers = self.get_string(tag)[1]?.split(separator).filter(s => s.trim() !== "");
                break;

                case "publisher":
                    data.publisher = self.get_string(tag)[1];
                break;

                case "date":
                    try {
                        data.date = new Date(self.get_string(tag)[1]);
                    } catch(_) {}
                break;

                case "lyrics":
                    data.lyrics = self.get_string(tag)[1];
                break;
            }
        });

        return data;
    }
}

export namespace Meta {   
    export type Data = Partial<{
        title: string;
        albumName: string;
        albumArtists: Array<string>;
        pictureData: string;
        discNumber: number;
        barcode: number;
        trackNumber: number;
        explicit: boolean;
        trackTotal: number;
        composers: Array<string>;
        publisher: string;
        date: Date;
        artists: Array<string>;
        lyrics: string;
    }>;

    export class MetaReadError extends Error {
        message = "A metadata read error occurred";

        constructor(cause?: string) {
            super();
            this.cause = cause;
        }
    }

    export class MetaMissingPluginsError extends Error {
        #elements: Array<string>;
        message = "Gstreamer is missing plugins to read the metadata of the file";

        get missingElements() { return this.#elements; }

        constructor(missingElements: Array<string>) {
            super();

            this.#elements = missingElements;
            this.cause = `Missing element(s): ${this.missingElements.join('\n')}`
        }
    }

    export class MetaTimeoutError extends Error {
        message = "Metadata reading timed out";
        constructor() { super(); }
    }
}
