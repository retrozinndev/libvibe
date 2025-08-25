import GObject, { getter, ParamSpec, register } from "gnim/gobject";
import Artist from "./_artist";
import Song from "./_song";

/** store album information */
@register({ GTypeName: "VibeAlbum" })
export default class Album extends GObject.Object {

    public static ArrayParamSpec = (name: string, flags: GObject.ParamFlags) =>
        GObject.ParamSpec.jsobject(name, null, null, flags) as ParamSpec<Array<Album>>;
    public static ParamSpec = (name: string, flags: GObject.ParamFlags) => 
        GObject.ParamSpec.jsobject(name, null, null, flags) as ParamSpec<Album>;

    /** the object's unique identifier for the plugin */
    readonly id: any;

    readonly #artist: Array<Artist>|null = null;
    readonly #title: string|null = null;
    readonly #description: string|null = null;
    readonly #url: string|null = null;
    readonly #songs: Array<Song>;
    readonly #single: boolean = false;

    /** the artists of this album, can be null */
    @getter(Artist.ArrayParamSpec)
    get artist() { return this.#artist!; }

    @getter(String)
    get description() { return this.#description!; }

    /** the album's title, can be null */
    @getter(String)
    get title() { return this.#title!; }

    /** the album's url, can be null */
    @getter(String)
    get url() { return this.#url!; }

    /** the songs that compose this album */
    @getter(Song.ArrayParamSpec)
    get songs() { return this.#songs; }

    /** true if the album is a single(only has single song) */
    @getter(Boolean)
    get single() { return this.#single; }


    constructor(properties: {
        artist: Array<Artist>;
        songs: Array<Song>;
        id?: any;
        title?: string;
        description?: string;
        url?: string;
        single?: boolean;
    }) {
        super();

        this.#title = properties.title ?? null;
        this.#artist = properties.artist ?? null;
        this.#description = properties.description ?? null;
        this.#url = properties.url ?? null;
        this.#songs = properties.songs ?? null;
        this.#single = properties.single ?? this.#songs.length === 1;
    }
}
