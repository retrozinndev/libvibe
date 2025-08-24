import GObject, { getter, ParamSpec, register } from "gnim/gobject";
import Artist from "./_artist";
import Album from "./_album";


@register({ GTypeName: "VibeSong" })
export default class Song extends GObject.Object {

    public static ParamSpec = (name: string, flags: GObject.ParamFlags) => 
        GObject.ParamSpec.jsobject(name, null, null, flags) as ParamSpec<Song>;

    readonly #name?: string;
    readonly #artist?: Array<Artist>;
    readonly #album?: Album;
    readonly #url?: string;

    /** the unique identifier of this song, usually defined 
    * by the plugin on song import.
    * @method Vibe.generateSongID() to generate an ID
    */
    public id: any;

    /** the song name. can be null */
    @getter(String) 
    get name() { return this.#name!; }

    /** the authors of the song, can be null */
    @getter(Artist.ArrayParamSpec) 
    get artist() { return this.#artist!; }

    /** the album object where this song belongs, can be null */
    @getter(Album.ParamSpec)
    get album() { return this.#album!; }

    /** the song's url, can be null */
    @getter(String)
    get url() { return this.#url!; }


    constructor(properties: {
        name?: string;
        id?: any;
        artist?: Array<Artist>;
        url?: string;
        album?: Album;
    }) {
        super();

        this.id = properties.id;

        if(properties.url !== undefined)
            this.#url = properties.url;

        if(properties.name !== undefined)
            this.#name = properties.name;

        if(properties.album !== undefined) 
            this.#album = properties.album;

        if(properties.artist !== undefined)
            this.#artist = properties.artist;
    }
}
