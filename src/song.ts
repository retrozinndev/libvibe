import Gio from "gi://Gio?version=2.0";
import GObject, { getter, ParamSpec, register } from "gnim/gobject";
import GdkPixbuf from "gi://GdkPixbuf?version=2.0";
import Artist from "./artist";
import Album from "./album";


/* store song data */
@register({ GTypeName: "VibeSong" })
export default class Song extends GObject.Object {

    /** the unique identifier of this song, usually defined 
    * by the plugin on load.
    * @method Vibe.generateSongID() to generate an ID for this object
    */
    readonly id: any;

    readonly #name: string|null;
    readonly #artist: Array<Artist>|null;
    readonly #album: Album|null = null;
    readonly #url: string|null = null;
    readonly #file: Gio.File|null;
    readonly #image: GdkPixbuf.Pixbuf|null = null;


    /** the song name. can be null */
    @getter(String) 
    get name() { return this.#name!; }

    /** the authors of this song, can be null */
    @getter(Array<Artist>) 
    get artist() { return this.#artist!; }

    /** the album object where this song belongs, can be null */
    @getter(Album as unknown as ParamSpec<Album|null>)
    get album() { return this.#album; }

    /** the song's url, can be null */
    @getter(String)
    get url() { return this.#url!; }

    /** the song's file path or GFile, can be null */
    @getter(Gio.File)
    get file() { return this.#file!; }

    /** the song's individual image. usually, you don't need to define this,
    * as it's expected that only the album has an image; but you can also
    * use this if needed. can be null */
    @getter(GdkPixbuf.Pixbuf as unknown as ParamSpec<GdkPixbuf.Pixbuf|null>)
    get image() { return this.#image; }

    constructor(properties: {
        name?: string;
        id?: any;
        artist?: Array<Artist>;
        file: Gio.File|string;
        url?: string;
        image?: GdkPixbuf.Pixbuf;
        album?: Album;
    }) {
        super();

        this.id = properties.id;
        this.#file = (typeof properties.file === "string" ?
            Gio.File.new_for_path(properties.file)
        : properties.file) ?? null;

        this.#url = properties.url ?? null;
        this.#name = properties.name ?? null;
        this.#image = properties.image ?? null;
        this.#album = properties.album ?? null;
        this.#artist = properties.artist ?? null;
    }
}
