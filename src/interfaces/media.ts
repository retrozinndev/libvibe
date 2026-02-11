import GObject from "gnim/gobject";
import { Song, SongList } from "../objects";


/** interface implemented by the vibe app to control media from each plugin. 
  * don't forget to implement the object's signals! */
export interface Media extends GObject.Object {
    /** currently-playing song */
    get song(): Song|null;
    /** current queue */
    get queue(): SongList|null;
    /** get the player status(playing, paused, stopped...) */
    get status(): Media.PlaybackStatus;
    /** current song's length in microseconds */
    get length(): number;
    /** loop mode: none(no loop), list(playlist, album, queue...) or song */
    loop: Media.LoopMode;
    /** queue shuffle mode */
    shuffle: Media.ShuffleMode;
    /** current song position in microseconds. if nothing is playing, it's set to 0. */
    position: number;
    /** audio stream volume, min is 0 and max is 100 */
    volume: number;
    /** whether to mute/unmute the media */
    mute: boolean;

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

    // for type specification only
    connect<S extends keyof Media.SignalSignatures>(
        signal: S,
        callback: (self: Media, ...params: Parameters<Media.SignalSignatures[S]>) => ReturnType<Media.SignalSignatures[S]>
    ): number;

    emit<S extends keyof Media.SignalSignatures>(
        signal: S,
        ...args: Parameters<Media.SignalSignatures[S]>
    ): void;
}

export namespace Media {
    export enum LoopMode {
        /** no loop */
        NONE = 0,
        /** loop through song list(playlist, album, queue...) */
        LIST = 1,
        /** only loop the currently-playing song */
        SONG = 2
    }

    export enum ShuffleMode {
        /** no shuffle @default */
        NONE = 0,
        /** shuffle the order of the songlist(playlist, album, queue...) */
        SHUFFLE = 1,
        /** (not yet supported, will fallback to SHUFFLE) smart shuffle the 
        * songlist(album, playlist, queue...) */
        SMART_SHUFFLE = 2
    }

    export enum PlaybackStatus {
        /** the player is stopped, no media is playing */
        STOPPED = 0,
        /** the song is playing */
        PLAYING = 1,
        /** the song is paused */
        PAUSED = 2,
        /** indicates wheter the song is still preparing to play, currently not implemented */
        LOADING = 3
    }

    export interface SignalSignatures extends GObject.Object.SignalSignatures {
        /** the song has been paused */
        "paused": (song: Song) => void;
        /** the song has been resumed */
        "resumed": (song: Song) => void;
        /** jumped to next song. song can be null if there's no next song to jump to */
        "gone-next": (song: Song, queuePosition: number) => void;
        /** rewinded to previous song. song can be null if there's no previous song to go to */
        "gone-previous": (song: Song, queuePosition: number) => void;
        /** emitted when a song gets played(doesn't get emitted on ::next, ::previous nor ::resume) */
        "playing": (song: Song) => void;
        "notify::song": () => void;
        "notify::queue": () => void;
        "notify::status": () => void;
        "notify::length": () => void;
        "notify::volume": () => void;
        "notify::loop": () => void;
        "notify::shuffle": () => void;
        "notify::position": () => void;
        "notify::mute": () => void;
    }
}
