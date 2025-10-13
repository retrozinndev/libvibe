import Gio from "gi://Gio?version=2.0";
import GObject, { getter, gtype, register } from "gnim/gobject";
import GdkPixbuf from "gi://GdkPixbuf?version=2.0";
import Artist from "./artist";
import Album from "./album";
import Gst from "gi://Gst?version=1.0";


export namespace Song {
    export interface SignalSignatures extends GObject.Object.SignalSignatures {

        "notify::stream": (stream: Gst.Stream) => void;
        /** emitted when the previous song is about to finish, so the next one can be prepared for a faster load time */
        "prepare": () => void;
    }
}

/* store song data */
@register({ GTypeName: "VibeSong" })
export default class Song extends GObject.Object {

    /** the unique identifier of this song, usually defined 
    * by the plugin on load.
    * @method Vibe.generateID() to generate an ID for this object
    */
    readonly id: any;

    readonly #name: string|null = null;
    readonly #artist: Array<Artist>|null = null;
    readonly #album: Album|null = null;
    readonly #url: string|null = null;
    readonly #file: Gio.File|null = null;
    readonly #image: GdkPixbuf.Pixbuf|null = null;

    #stream: Gst.Stream|null = null;

    /** the song name. can be null */
    @getter(gtype<string|null>(String)) 
    get name() { return this.#name; }

    /** the authors of this song, can be null */
    @getter(gtype<Array<Artist>|null>(Array)) 
    get artist() { return this.#artist; }

    /** the album object where this song belongs, can be null */
    @getter(gtype<Album|null>(Album))
    get album() { return this.#album; }

    /** the song's url, can be null */
    @getter(gtype<string|null>(String))
    get url() { return this.#url; }

    /** the song's file path or GFile, can be null */
    @getter(gtype<Gio.File|null>(Gio.File))
    get file() { return this.#file; }

    /** the song's individual image. usually, you don't need to define this,
    * as it's expected that only the album has an image; but you can also
    * use this if needed. can be null */
    @getter(gtype<GdkPixbuf.Pixbuf|null>(GdkPixbuf.Pixbuf))
    get image() { return this.#image; }

    /** stream for the app to play. you can use this if the plugin streams songs from the internet instead of downloading them */
    @getter(gtype<Gst.Stream|null>(Gst.Stream))
    get stream() { return this.#stream; }

    constructor(properties: {
        name?: string;
        id?: any;
        artist?: Array<Artist>;
        /** play a file instead of a stream */
        file?: Gio.File|string;
        /** a stream to play instead of a file */
        stream?: Gst.Stream;
        url?: string;
        /** song's own image. usually you don't need to define this, as vibe will automatically get the image from the song's album if available. */
        image?: GdkPixbuf.Pixbuf;
        album?: Album;
    }) {
        super();

        this.id = properties.id;

        if(properties.file !== undefined)
            this.#file = (typeof properties.file === "string" ?
                Gio.File.new_for_path(properties.file)
            : properties.file);

        if(properties.stream !== undefined)
            this.#stream = properties.stream;

        if(properties.url !== undefined)
            this.#url = properties.url;

        if(properties.name !== undefined)
            this.#name = properties.name;

        if(properties.image !== undefined)
            this.#image = properties.image;

        if(properties.artist !== undefined)
            this.#artist = properties.artist;
    }
}
