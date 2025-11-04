import GdkPixbuf from "gi://GdkPixbuf?version=2.0";
import { getter, gtype, register } from "gnim/gobject";
import { Vibe } from "..";
import { Plugin } from "../plugin";
import { Song } from "./song";
import { Artist } from "./artist";
import { SongList } from "./songlist";


/** store album information */
@register({ GTypeName: "VibeAlbum" })
export class Album extends SongList {
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
        id?: any;
        plugin?: Plugin;
        description?: string;
        url?: string;
        single?: boolean;
    }) {
        super({
            title: properties.title,
            image: properties.image,
            description: properties.description,
            plugin: properties.plugin,
            songs: properties.songs,
            id: properties.id
        });

        if(properties.artist !== undefined)
            this.#artist = properties.artist;

        if(properties.url !== undefined)
            this.#url = properties.url;

        if(properties.single !== undefined)
            this.#single = properties.single;

        if(properties.plugin)
            Vibe.getDefault().emit(
                "album-added", 
                properties.plugin,
                this
            );
    }
}
