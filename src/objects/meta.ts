import Gio from "gi://Gio?version=2.0";
import Gst from "gi://Gst?version=1.0";
import GstPbutils from "gi://GstPbutils?version=1.0";


// This is still heavily WIP

/** retrieve metadata from media files, and apply them to a vibe object */
export abstract class Meta {

    /** get metadata tags(GstTags) from a media file 
      * @param file the GFile/path of the media where to get the data from
      * @param separator optional metadata separator. by default it's a comma: ','
      *
      * @returns a {@link Meta.Data} object, containing the meta tags from the file(can be empty if there's none) */
    public static getMetaTags(file: string|Gio.File, separator: string = ','): Meta.Data {
        file = typeof file === "string" ?
            Gio.File.new_for_path(file)
        : file;

        if(!file.query_exists(null))
            throw new Meta.MetaReadError("File either doesn't exist or isn't accessible");

        GstPbutils.pb_utils_init();

        const discoverer = GstPbutils.Discoverer.new(-1);
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

        const tags = info.get_tags();
        if(!tags)
            return {}; // no tags

        return this.taglistToData(tags, separator);
    }

    public static async getMetaTagsAsync(file: string|Gio.File, separator: string = ','): Promise<Meta.Data> {
        return this.getMetaTags(file, separator);
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
            switch(tag.toLowerCase()) {
                case "title":
                    data.title = self.get_string(tag)[1];
                break;

                case "artist":
                    data.artists = self.get_string(tag)[1]?.split(separator).filter(s => s.trim() !== "");
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
