import GdkPixbuf from "gi://GdkPixbuf?version=2.0";
import { getter, ParamSpec, register } from "gnim/gobject";
import Artist from "./artist";
import Song from "./song";
import SongList from "./songlist";


/** store album information */
@register({ GTypeName: "VibeAlbum" })
export default class Album extends SongList {
    /** the object's unique identifier for the plugin */
    readonly id: any;

    readonly #artist: Array<Artist>|null = null;
    readonly #url: string|null = null;
    readonly #image: GdkPixbuf.Pixbuf|null = null;
    readonly #songs: Array<Song>;
    readonly #single: boolean = false;

    /** the artists of this album, can be null */
    @getter(Array<Artist> as unknown as ParamSpec<Array<Artist>|null>)
    get artist() { return this.#artist; }

    /** the album's url, can be null */
    @getter(String as unknown as ParamSpec<string|null>)
    get url() { return this.#url; }

    /** the songs that compose this album */
    @getter(Array<Song>)
    get songs() { return this.#songs; }

    /** true if the album is a single(only has single song) */
    @getter(Boolean)
    get single() { return this.#single; }

    /** the album's image, in pixbuf. can be null */
    @getter(GdkPixbuf.Pixbuf as unknown as ParamSpec<GdkPixbuf.Pixbuf|null>)
    get image() { return this.#image; }

    constructor(properties: {
        artist: Array<Artist>;
        songs: Array<Song>;
        id?: any;
        image?: GdkPixbuf.Pixbuf;
        title?: string;
        description?: string;
        url?: string;
        single?: boolean;
    }) {
        super();

        this._title = properties.title ?? null;
        this._description = properties.description ?? null;

        this.#artist = properties.artist ?? null;
        this.#image = properties.image ?? null;
        this.#url = properties.url ?? null;
        this.#songs = properties.songs ?? null;
        this.#single = properties.single ?? this.#songs.length === 1;
    }
}
