import GdkPixbuf from "gi://GdkPixbuf?version=2.0";
import Gly from "gi://Gly?version=2";
import GObject, { getter, gtype, property, register, signal } from "gnim/gobject";
import { Song } from "./song";
import { Vibe } from "..";
import { Plugin } from "../plugin";


/** base class for song lists(albums and playlists) */
@register({ GTypeName: "VibeSongList" })
export class SongList extends GObject.Object {
    readonly id: any;

    declare $signals: SongList.SignalSignatures;

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

    @property(gtype<GdkPixbuf.Pixbuf|Gly.Image|null>(GObject.Object))
    image: GdkPixbuf.Pixbuf|Gly.Image|null = null;

    @signal(GObject.Object)
    added(_: Song) {}

    @signal(GObject.Object)
    removed(_: Song) {}

    @signal(GObject.Object, gtype<Song|null>(GObject.Object))
    reordered(_: Song, __: Song|null) {}

    constructor(properties?: {
        songs?: Array<Song>;
        title?: string;
        plugin?: Plugin;
        id?: any;
        image?: GdkPixbuf.Pixbuf|Gly.Image;
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
            const [song] = this._songs.splice(a, 1);
            if(song) {
                this.emit("removed", song);
                this.notify("songs");
            }
            return;
        }

        for(let i = 0; i < this._songs.length; i++) {
            const song = this._songs[i];

            if(song.id === a.id) {
                this.emit("removed", this._songs.splice(i, 1)[0]);
                this.notify("songs");
                break;
            }
        }
    }

    /** check if this list contains a song. 
      * this method uses id-based searching, if you manually changed 
      * the song ID at construction, you should be sure that this ID
      * is actually unique. 
      *
      * @returns true if the song was found, or else false */
    has(song: Song): boolean {
        for(const s of this._songs) {
            if(s.id === song.id) 
                return true;
        }

        return false;
    }

    /** update the position of a song with another 
      *
      * @param song the song to update the position(or its zero-based index)
      * @param newPos the new position for the song to be(zero-based)
      * 
      * if {@param newPos} is bigger than the size of the list, it'll be reordered
      * as the last element from the list.
      *
      * @returns the song that got "replaced" with the provided song */
    reorder(song: Song|number, newPos: number): void {
        const i = typeof song !== "number" ?
            this._songs.findIndex((s) => s.id === (song as Song).id)
        : song;

        song = this._songs[i];

        if(!song) {
            console.error(`Couldn't reorder songlist(${this.id
                }: either the provided value is not a song or it's not included in this list`);

            return;
        }

        // check if newPos is the same position(index) as current
        if(song.id === this._songs[newPos]?.id) 
            return;

        // whether to unshift(prepend) the song in the list
        const unshift: boolean = newPos < 0;

        // append/prepend song if newPos is bigger/smaller than the array size
        if(unshift || newPos > this._songs.length-1) {
            this._songs[(unshift ? "unshift" : "push")](song);
            this.notify("songs");
            this.emit("reordered", song, null);

            return;
        }

        const replaced = this._songs[newPos];
        this._songs[newPos] = song;
        this._songs[i] = replaced;
        this.notify("songs");
        this.emit("reordered", song, replaced);
    }

    connect<
        S extends keyof SongList.SignalSignatures,
        C extends SongList.SignalSignatures[S]
    >(
        signal: S, 
        callback: (self: typeof this, ...params: Parameters<C>) => ReturnType<C>
    ): number {
        return super.connect(signal, callback);
    }

    emit<S extends keyof SongList.SignalSignatures>(
        signal: S, 
        ...args: Parameters<SongList.SignalSignatures[S]>
    ): void {
        super.emit(signal, ...args);
    }

    notify(prop: keyof typeof this): void;
    notify(prop: string): void;

    notify(prop: (keyof typeof this)|string): void {
        super.notify(prop as string);
    }

    // to make _title, _description or _songs read-write, just implement
    // methods like set_title, set_description or set_songs, gnim will
    // automatically use them to update a property value
}

export namespace SongList {
    export interface SignalSignatures extends GObject.Object.SignalSignatures {
        "added": (song: Song) => void;
        "removed": (song: Song) => void;
        "reordered": (song: Song, replacedSong: Song|null) => void;
    }
}
