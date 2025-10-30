import GdkPixbuf from "gi://GdkPixbuf?version=2.0";
import { getter, gtype, register } from "gnim/gobject";
import Artist from "./artist";
import Song from "./song";
import SongList from "./songlist";


/** store album information */
@register({ GTypeName: "VibeAlbum" })
export default class Album extends SongList {
    readonly #artist: Array<Artist> = [];
    readonly #url: string|null = null;
    readonly #single: boolean = false;

    /** the artists of this album, can be null */
    @getter(Array<Artist>)
    get artist() { return this.#artist; }

    /** the album's url, can be null */
    @getter(gtype<string|null>(String))
    get url() { return this.#url; }

    /** true if the album is a single(only has single song) */
    @getter(Boolean)
    get single() { return this.#single; }

    constructor(properties: {
        artist: Array<Artist>;
        songs: Array<Song>;
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
        this.image = properties.image ?? null;
        this.#url = properties.url ?? null;
        if(properties.songs !== undefined)
            properties.songs.forEach(song =>
                this.add(song)
            );

        this.#single = properties.single ?? this._songs.length === 1;
    }
}
