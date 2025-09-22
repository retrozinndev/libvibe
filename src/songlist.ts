import GObject, { getter, gtype, register } from "gnim/gobject";
import Song from "./song";


/** base class for song lists(albums and playlists) */
@register({ GTypeName: "VibeSongList" })
export default class SongList extends GObject.Object {
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

    constructor(properties?: {
        songs?: Array<Song>;
        title?: string;
        description?: string;
    }) {
        super();

        if(properties === undefined)
            return;

        if(properties.songs !== undefined)
            this._songs = properties.songs;

        if(properties.title !== undefined)
            this._title = properties.title;

        if(properties.description !== undefined)
            this._description = properties.description;
    }

    /** pop the last song from this song list */
    pop(): void {
        
    }

    add(song: Song): void {
        this._songs.push(song);
        this.notify("songs");
    }

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
}
