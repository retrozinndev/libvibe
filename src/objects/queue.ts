import { register, signal } from "gnim/gobject";
import { SongList } from "./songlist";
import { Song } from "./song";


@register({ GTypeName: "VibeQueue" })
export class Queue extends SongList {
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
}
