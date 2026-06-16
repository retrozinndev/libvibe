import { property, register, signal } from "gnim/gobject";
import { SongList } from "./songlist";
import { Song } from "./song";


@register({ GTypeName: "VibeQueue" })
export class Queue extends SongList {
    declare $signals: Queue.SignalSignatures;

    @signal()
    protected cleared() {}

    /** the current song index */
    @property(Number)
    currentSong: number = -1;

    constructor(songs?: SongList|Array<Song>, current?: number) {
        super({
            title: "Queue",
            description: "Your track queue",
            songs: Array.isArray(songs) ? songs : songs?.toArray()
        });

        if(this.length > 0)
            this.currentSong = current != null && current <= this.length ?
                current
            : 0;
    }

    /** clears the song queue, emits ::cleared. you can add more songs using the 
      * {@link add} method */
    clear(): void {
        this._songs = [];
        (this as Queue).emit("cleared");
    }
}

export namespace Queue {
    export interface SignalSignatures extends SongList.SignalSignatures {
        "notify::current-song"(): void;
        "cleared"(): void;
    }
}
