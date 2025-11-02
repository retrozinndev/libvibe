import GObject, { getter, gtype, property, register } from "gnim/gobject";
import Song from "./song";
import GdkPixbuf from "gi://GdkPixbuf?version=2.0";
import Vibe from "./vibe";
import Plugin from "./plugin";


/** base class for song lists(albums and playlists) */
@register({ GTypeName: "VibeSongList" })
export default class SongList extends GObject.Object {
    readonly id: any;

    /** @protected array containing all songs in this list */
    protected _songs: Array<Song> = [];

    /** @protected the title for this song list */
    protected _title: string|null = null;

    /** @protected the description for this song list */
    protected _description: string|null = null;

    /** songs array, read-only property. you should use the provided
      * methods to update the data inside this song list */
    @getter(Array<Song>)
    get songs() { return this._songs; }

    /** title for this song list, can be null */
    @getter(gtype<string|null>(String))
    get title() { return this._title; }

    /** description for this song list, can be null */
    @getter(gtype<string|null>(String))
    get description() { return this._description; }

    @property(gtype<GdkPixbuf.Pixbuf|null>(GdkPixbuf.Pixbuf))
    image: GdkPixbuf.Pixbuf|null = null;


    constructor(properties?: {
        songs?: Array<Song>;
        title?: string;
        plugin?: Plugin;
        id?: any;
        image?: GdkPixbuf.Pixbuf;
        description?: string;
    }) {
        super();

        this.id = properties?.id ?? Vibe.getDefault().generateID();

        if(properties === undefined)
            return;

        if(properties.songs !== undefined)
            properties.songs.forEach(song =>
                this.add(song)
            );

        if(properties.plugin !== undefined)
            Vibe.getDefault().emit(
                "songlist-added",
                properties.plugin,
                this
            );

        if(properties.title !== undefined)
            this._title = properties.title;

        if(properties.description !== undefined)
            this._description = properties.description;

        if(properties.image !== undefined)
            this.image = properties.image;
    }

    /** pop the last song from this song list */
    pop(): void {
        this._songs.pop();
        this.notify("songs");
    }

    /** add a song to the song list */
    add(song: Song): void {
        this._songs.push(song);
        this.notify("songs");
    }

    /** loop through the song list */
    forEach(predicate: (song: Song, index: number) => void): void {
        this._songs.forEach((song, i) => predicate(song, i));
    }

    /** removes the first occurrence of the provided song 
      * @param song the song to be removed
      * @returns true if the song has been found in the list
      */
    remove(song: Song): void;

    /** remove the song matching with the provided index
      * @param index the index to be removed
      */
    remove(index: number): void;

    remove(a: Song|number): void {
        if(typeof a === "number") {
            this._songs.splice(a, 1);
            this.notify("songs");
            return;
        }

        for(let i = 0; i < this._songs.length; i++) {
            const song = this._songs[i];

            if(song.file !== null && a.file !== null &&
              song.file.get_path()! === a.file.get_path()!) {

                this._songs.splice(i, 1);
                this.notify("songs");
                break;
            }
        }
    }


    // to make _title, _description or _songs read-write, just implement
    // methods like set_title, set_description or set_songs, gnim will
    // automatically use them to update a property value
}
