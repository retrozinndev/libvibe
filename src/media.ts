import GObject from "gnim/gobject";
import Song from "./song";
import Queue from "./queue";
import SongList from "./songlist";


export interface MediaSignalSignatures extends GObject.Object.SignalSignatures {
    /** the song has been paused */
    "paused": () => void;
    /** the song has been resumed */
    "resume": () => void;
    /** jumped to next song. song can be null if there's no next song to jump to */
    "next": (song: Song|null) => void;
    /** rewinded to previous song. song can be null if there's no previous song to go to */
    "previous": (song: Song|null) => void;
    "notify::song": (song: Song|null) => void;
    "notify::queue": (queue: Queue|null) => void;
}

/** interface implemented by the vibe app to control media from each plugin */
export default interface Media extends GObject.Object {
    /** currently-playing song */
    get song(): Song|null;
    /** current queue */
    get queue(): Queue|null;

    /** play a specific song 
    * @param song the song to be played
    * @param pos song position to jump to */
    playSong(song: Song, pos: number): void;
    /** play a list of songs
    * @param list the song list to be played
    * @param posNum the song position in the list to start playing(zero-based) */
    playList(queue: SongList, posNum: number): void;

    /** resume media */
    resume(): void;
    /** pause media */
    pause(): void;
    /** jump to next item in queue(if any) */
    next(): void;
    /** go back to previous item in queue(if any) */
    previous(): void;
}
