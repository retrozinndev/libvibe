import { register, signal } from "gnim/gobject";
import { SongList } from "./songlist";
import { Song } from "./song";


@register({ GTypeName: "VibeQueue" })
export class Queue extends SongList {
    declare $signals: Queue.SignalSignatures;
    @signal()
    cleared() {}

    constructor(songs?: SongList|Array<Song>) {
        super({
            title: "Queue",
            description: "Your song queue",
            songs: Array.isArray(songs) ? songs : songs?.songs
        });
    }

    /** clears the song queue, emits ::cleared. you can add more songs using the 
      * {@link add} method */
    clear(): void {
        this._songs = [];
        this.notify("songs");
        this.emit("cleared");
    }

    emit<S extends keyof Queue.SignalSignatures>(
        signal: S, 
        ...args: Parameters<Queue.SignalSignatures[S]>
    ): void {
        super.emit(signal as never, ...args as never);
    }
}

export namespace Queue {
    export interface SignalSignatures extends SongList.SignalSignatures {
        "cleared": () => void;
    }
}
