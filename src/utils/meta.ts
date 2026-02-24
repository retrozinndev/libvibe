import Gio from "gi://Gio?version=2.0";
import Gst from "gi://Gst?version=1.0";
import GstPbutils from "gi://GstPbutils?version=1.0";
import { Song } from "../objects/song";
import { Plugin } from "../plugin";
import { Artist } from "../objects/artist";
import { Vibe } from "..";
import { Album } from "../objects/album";
import GLib from "gi://GLib?version=2.0";
import GObject from "gnim/gobject";
import { Image } from "./image";


/** retrieve metadata from media files, and apply them to a vibe object */
export abstract class Meta {

    /** get metadata tags(GstTags) from a media file 
      * @param file the GFile/path of the media where to get the data from
      * @param separator optional metadata separator. by default it's a comma: ','
      * @param timeout optionally specify a timeout for GstPbutilsDiscoverer to work with(nanoseconds)
      *
      * @returns a {@link Meta.Data} object, containing the meta tags from the file(can be empty if there's none) */
    public static getMetaTags(file: string|Gio.File, separator: string = ',', timeout: number = Gst.SECOND * 2.5, options: {
        enableLogs?: boolean;
    } = {}): Meta.Data {
        file = typeof file === "string" ?
            Gio.File.new_for_path(file)
        : file;

        if(!file.query_exists(null))
            throw new Meta.MetaReadError("File either doesn't exist or isn't accessible");

        if(!Gst.is_initialized())
            Gst.init([]);

        GstPbutils.pb_utils_init();

        options.enableLogs ??= false;

        const info = this.discover(file, timeout, options.enableLogs);
        const streamTags = info.get_tags(), 
            audioStreamTags = info.get_audio_streams().map(audStream => audStream.get_tags());

        this.handleDiscovererResults(info);

        const taglists: Array<Gst.TagList> = [];

        if(streamTags)
            taglists.push(streamTags);

        if(audioStreamTags)
            taglists.push(...audioStreamTags.filter(tag => tag != null));


        if(!taglists)
            return {}; // no tags

        return this.taglistToData(taglists, separator, {
            enableLogs: options.enableLogs
        });
    }

    public static async getMetaTagsAsync(file: string|Gio.File, separator: string = ',', timeout: number = Gst.SECOND * 2.5, options: {
        enableLogs?: boolean;
    } = {}): Promise<Meta.Data> {
        file = typeof file === "string" ?
            Gio.File.new_for_path(file)
        : file;

        if(!file.query_exists(null))
            throw new Meta.MetaReadError("File either doesn't exist or isn't accessible");

        if(!Gst.is_initialized())
            Gst.init([]);

        GstPbutils.pb_utils_init();

        options.enableLogs ??= false;

        const info = await this.discoverAsync(file, timeout, options.enableLogs);
        const streamTags = info.get_tags(), 
            audioStreamTags = info.get_audio_streams().map(audStream => audStream.get_tags());

        this.handleDiscovererResults(info);

        const taglists: Array<Gst.TagList> = [];

        if(streamTags)
            taglists.push(streamTags);

        if(audioStreamTags)
            taglists.push(...audioStreamTags.filter(tag => tag != null));


        if(!taglists)
            return {}; // no tags

        return this.taglistToData(taglists, separator, {
            enableLogs: options.enableLogs
        });
    }

    /** throws `Meta` errors depending on the `info` given to it */
    private static handleDiscovererResults(info: GstPbutils.DiscovererInfo): void {
        switch(info.get_result()) {
            case GstPbutils.DiscovererResult.ERROR:
                throw new Meta.MetaReadError("An unkown error occurred on GstPbutilsDiscoverer");

            case GstPbutils.DiscovererResult.MISSING_PLUGINS:
                throw new Meta.MetaMissingPluginsError(info.get_missing_elements_installer_details());
            
            case GstPbutils.DiscovererResult.URI_INVALID:
                throw new Meta.MetaReadError("Invalid URI for file");

            case GstPbutils.DiscovererResult.TIMEOUT:
                throw new Meta.MetaTimeoutError();
        }
    }

    /** gets media info(e.g.: tags) for `file` using `GstPbutilsDiscoverer`.
      * this is mainly used for getting tags for media files
      * @param file the media's `GFile`
      * @param timeout discovering timeout for info
      * @param printErrors whether you want to log any errors that occur
      *
      * @returns a GstPbutilsDiscovererInfo of `file`, containing info and tags for the file */
    public static discover(file: Gio.File, timeout: number = Gst.SECOND * 2.5, printErrors: boolean = true): GstPbutils.DiscovererInfo {
        const discoverer = GstPbutils.Discoverer.new(timeout);
        const id = discoverer.connect("discovered", (_, __, err) => {
            if(!printErrors || !err)
                return;

            console.error(err);
        });
        const finishedId = discoverer.connect("finished", () => {
            discoverer.disconnect(id);
            discoverer.disconnect(finishedId);
        });
        const info = discoverer.discover_uri(
            !file.has_uri_scheme("file") ?
                file.get_uri()
            : `file://${file.peek_path()}`
        );

        return info;
    }

    /** asynchronously gets media info(e.g.: tags) for `file` using `GstPbutilsDiscoverer`.
      * this is mainly used for getting tags for media files
      * @param file the media's `GFile`
      * @param timeout discovering timeout for info
      * @param printErrors whether you want to log any errors that occur
      *
      * @returns a GstPbutilsDiscovererInfo of `file`, containing info and tags for the file */
    public static async discoverAsync(
        file: Gio.File,
        timeout: number = Gst.SECOND * 2.5,
        printErrors: boolean = true
    ): Promise<GstPbutils.DiscovererInfo> {

        return new Promise((resolve, reject) => {
            const discoverer = GstPbutils.Discoverer.new(timeout);
            let info: GstPbutils.DiscovererInfo|null = null;

            const ids: Array<number> = [
                discoverer.connect("finished", () => {
                    ids.forEach(id => discoverer.disconnect(id));
                    discoverer.stop();
                    if(!info) {
                        reject(new Error("Couldn't get info from stream, DiscovererInfo is null"));
                        return;
                    }

                    resolve(info);
                }),
                discoverer.connect("discovered", (_, discoverInfo, err) => {
                    if(printErrors && err) {
                        console.error(err);
                        return;
                    }

                    if(!info && discoverInfo)
                        info = discoverInfo;
                })
            ];

            discoverer.start();
            discoverer.discover_uri_async(
                !file.has_uri_scheme("file") ?
                    file.get_uri()
                : `file://${file.peek_path()}`
            );
        });
    }

    /** asynchronously gets media info(e.g.: tags) for each file using a single `GstPbutilsDiscoverer` instance.
      * this is mainly used for getting tags for media files
      * @param files array of `GFile`s containing all the files that you want to get info from
      * @param timeout discovering timeout for each file
      * @param printErrors whether you want to log any errors that occur
      *
      * @returns an `Array`, containing references to the respective `GFile` and its `DiscovererInfo`. `[GFile, GstPbutilsDiscovererInfo]`*/
    public static async discoverManyAsync(
        files: Array<Gio.File>,
        timeout: number = Gst.SECOND * 2.5,
        printErrors: boolean = true
    ): Promise<Array<[Gio.File, GstPbutils.DiscovererInfo]>> {

        if(files.length < 1)
            return [];

        return new Promise((resolve, reject) => {
            const discoverer = GstPbutils.Discoverer.new(timeout);
            const discovered: Array<[Gio.File, GstPbutils.DiscovererInfo]> = [];
            let file: Gio.File = files[0], i: number = 0;

            const ids: Array<number> = [
                discoverer.connect("finished", () => {
                    ids.forEach(id => discoverer.disconnect(id));
                    discoverer.stop();
                    if(discovered.length < 1) {
                        reject(new Error("Couldn't get info from streams, no data could be discovered"));
                        return;
                    }

                    resolve(discovered);
                }),
                discoverer.connect("discovered", (_, info, err) => {
                    if(printErrors && err) 
                        console.error(err);

                    if(info)
                        discovered.push([file, info]);

                    file = files[i++];
                })
            ];

            discoverer.start();

            for(const file of files) {
                discoverer.discover_uri_async(
                    !file.has_uri_scheme("file") ?
                        file.get_uri()
                    : `file://${file.peek_path()}`
                );
            }
        });
    }

    /** applies `data` to `Song` objects. properties like `:title`, `:artist` and `:album-name` are set
      * automatically by this function if they're set.
      *
      * the `plugin` parameter is used to search for existing objects declared by the plugin. it
      * avoids creating duplicate objects, like Albums and Artists.
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
        /** whether to apply the same song picture/image to the artist.
          * @default true */
        applyImageToArtist?: boolean;
    } = {}): void {
        if(Object.keys(data).length < 1)
            return;

        options.applyImage ??= true;
        options.applyImageToArtist ??= true;

        if(data.title !== undefined)
            song.title = data.title;

        if(data.explicit !== undefined)
            song.explicit = data.explicit;

        if(data.isrc !== undefined)
            song.isrc = data.isrc;

        if(data.lyrics !== undefined)
            song.lyrics = data.lyrics;

        if(data.publisher !== undefined)
            song.publisher = data.publisher;

        if(data.discNumber !== undefined)
            song.discNumber = data.discNumber;

        if(data.trackNumber !== undefined)
            song.trackNumber = data.trackNumber;

        if(data.date !== undefined)
            song.date = data.date;

        // smart-fill artists (it avoids creating duplicate objects by searching for existing matches by name!)
        // though, smart fill only works if `plugin` is set.
        // here, `plugin` is used to find existing objects created by the plugin itself.
        if(data.artists !== undefined && data.artists.length > 0) {
            for(const name of data.artists) {
                if(plugin) {
                    const match = this.findMatchingArtist(name, plugin);

                    if(match) {
                        song.artist.push(match);
                        continue;
                    }
                }

                song.artist.push(new Artist({
                    name,
                    plugin
                }));
                song.notify("artist");
            }
        }

        // also has a smart fill: searches for an existing album with matching artists to fill!
        if(data.albumName !== undefined) {
            if(plugin) {
                const albumArtists = data.albumArtists && data.albumArtists.length > 0 ?
                    data.albumArtists.map(name => this.findMatchingArtist(name, plugin) ?? 
                        new Artist({ name, plugin }))
                : song.artist;
                const match = this.findMatchingAlbum(data.albumName, albumArtists, plugin);

                if(match)
                    song.album = match;

                // add song if not in the album already
                if(!match?.has(song))
                    match?.add(song);
            } else {
                song.album = new Album({
                    title: data.albumName,
                    artist: song.artist,
                    plugin
                });

                if(!song.album.has(song))
                    song.album.add(song);
            }
        }

        // check if there's no image to apply OR it's already done
        if(!options.applyImage || data.pictureData === undefined || 
           ((song.album?.image || song.image) && 
            (options.applyImageToArtist && 
             (song.artist.every(art => art.image !== null ||
              song.album?.artist.every(art => art.image !== null)))))
        ) {
            return;
        }

        // these nullish-coalescing operators are here to avoid creation of duplicate Image objects.
        // duplicates can happen if another song from the same album is having its tags applied after the another from the same album/artist
        const image = song.album?.image ?? song.image ?? new Image(
            data.pictureData, Image.generateCacheName(song)
        );

        // apply album image if there isn't one (ignored if the song has no album)
        if(song.album && !song.album.image) 
            song.album.image = image;

        // set song's own image if there's no album
        if(!song.album && !song.image)
            song.image = image;

        if(!options.applyImageToArtist)
            return;

        // also apply image to artists if they're unset
        // (usually, all of the artists from the album are in some of the songs, so we don't need to care for the album artists)
        for(const artist of song.artist) {
            if(artist.image)
                continue;

            artist.image = image;
        }
    }

    /** tries to find a matching `Artist` object with the provided name
      * @param name the artist name to find a match to
      * @param plugin the plugin that is using the method 
      *
      * @returns the matching `Artist` object if found, or else, `undefined` */
    public static findMatchingArtist(name: string, plugin: Plugin): Artist|undefined {
        const targetPluginId = plugin.id;
        const match = Vibe.getDefault().artists.find(({ artist, plugin }) =>
            plugin.id === targetPluginId && artist.name === name
        );

        return match?.artist;
    }

    /** tries to find a matching `Album` object with the provided name and artist(s)
      * @param title the album title to find a match to
      * @param artists list of the album artists
      * @param plugin the plugin that is using the method 
      *
      * @returns the matching `Album` object if found, or else, `undefined` */
    public static findMatchingAlbum(title: string, artists: Array<Artist>, plugin: Plugin): Album|undefined {
        const targetPluginId = plugin.id;
        const artistIds = artists.map(art => art.id);
        const match = Vibe.getDefault().albums.find(({ album, plugin }) => {
            if(plugin.id !== targetPluginId)
                return false;

            if(title !== album.title)
                return false;

            let artistsMatch: boolean = artists.length < 1 && album.artist.length < 1;
            let matchCount: number = 0;
            for(const artist of album.artist) {
                if(artistIds.find(id => id === artist.id))
                    matchCount++;
            }

            return matchCount === artistIds.length || artistsMatch;
        });

        return match?.album;
    }

    private static getTagString(taglist: Gst.TagList, tag: string): string|undefined {
        return GObject.type_check_value_holds(taglist.get_value_index(tag, 0), GObject.TYPE_STRING) ?
            taglist.get_string(tag)[1]
        : undefined;
    }

    private static getTagNumber(taglist: Gst.TagList, tag: string): number|undefined {
        return Number.parseInt(taglist.get_string(tag)[1]) ?? undefined;
    }

    private static getTagDate(taglist: Gst.TagList, tag: string): Gst.DateTime|undefined {
        return GObject.type_check_value_holds(taglist.get_value_index(tag, 0), Gst.DateTime.$gtype) ?
            taglist.get_date_time(tag)[1]
        : undefined;
    }

    /** convert a `GstTagList` to a `Meta.Data` object. 
      * 
      * @param taglist the `GstTagList` you want to convert
      * @param separator an optional metadata separator. the default is a comma: ',' 
      *
      * @returns a `Meta.Data` object with the result of the convertion */
    public static taglistToData(taglist: Array<Gst.TagList>, separator: string = ',', options: {
        enableLogs?: boolean;
    } = {}): Meta.Data {
        const data: Meta.Data = {};

        options.enableLogs ??= false;

        taglist.forEach(list => list.foreach((self, tag) => {
            switch(tag) {
                case Gst.TAG_TITLE:
                    data.title = this.getTagString(self, tag);
                break;

                case Gst.TAG_ARTIST:
                    data.artists = this.getTagString(self, tag)?.split(separator).filter(s => s.trim() !== "")
                        .map(art => !/^ *$/.test(art) ? art.trim() : art);
                break;

                case Gst.TAG_ALBUM_ARTIST:
                    data.albumArtists = this.getTagString(self, tag)?.split(separator).filter(s => s.trim() !== "")
                        .map(art => !/^ *$/.test(art) ? art.trim() : art);
                break;

                case Gst.TAG_ALBUM:
                    data.albumName = this.getTagString(self, tag);
                break;

                case Gst.TAG_IMAGE:
                    const sample = self.get_sample(tag)[1];
                    const info = sample.get_buffer()?.map(Gst.MapFlags.READ)[1];

                    data.pictureData = info?.data;
                break;

                case Gst.TAG_ALBUM_VOLUME_NUMBER:
                    data.discNumber = this.getTagNumber(self, tag);
                break;

                case Gst.TAG_TRACK_NUMBER:
                    data.trackNumber = this.getTagNumber(self, tag);
                break;

                case Gst.TAG_ISRC:
                    data.isrc = this.getTagString(self, tag);
                break;

                case "common::lyrics-rating":
                case "common::rating":
                    data.explicit = /explicit|advisory|[1]|true/i.test(this.getTagString(self, tag) ?? "");
                break;

                case Gst.TAG_COMPOSER:
                    data.composers = this.getTagString(self, tag)?.split(separator).filter(s => s.trim() !== "")
                        .map(comp => !/^ *$/.test(comp) ? comp.trim() : comp);
                break;

                case Gst.TAG_PUBLISHER:
                    data.publisher = this.getTagString(self, tag);
                break;

                case Gst.TAG_DATE:
                    data.date = this.getTagDate(self, tag);
                break;

                case Gst.TAG_LYRICS:
                    data.lyrics = this.getTagString(self, tag);
                break;
            }
        }));

        return data;
    }
}

export namespace Meta {   
    export type Data = Partial<{
        title: string;
        albumName: string;
        albumArtists: Array<string>;
        pictureData: Uint8Array|GLib.Bytes;
        discNumber: number;
        isrc: string;
        trackNumber: number;
        explicit: boolean;
        composers: Array<string>;
        publisher: string;
        date: Gst.DateTime;
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
