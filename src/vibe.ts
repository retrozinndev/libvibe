import GObject, { getter, gtype, register } from "gnim/gobject";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import Song from "./song";
import SongList from "./songlist";
import Artist from "./artist";


export type IconButton = {
    id: any;
    iconName: string;
    onClicked?: () => void;
};

export type LabelButton = {
    id: any;
    label: string;
    onClicked?: () => void;
};

export type Section = {
    title: string;
    description?: string;
    type?: "listrow"|"row";
    content?: Array<Song|SongList|Artist>;
    headerButtons?: Array<IconButton | LabelButton>;
    endButton?: IconButton | LabelButton;
};


/** states where the player can be */
export enum PlayerState {
    /** nothing */
    NONE = 0,
    /** there's a song playing */
    PLAYING = 1,
    /** the song is paused */
    PAUSED = 2,
    /** the player has stopped */
    STOPPED = 3
}

export const isIconButton = (obj: object): obj is IconButton =>
    Boolean(Object.hasOwn(obj, "iconName") && Object.hasOwn(obj, "onClicked"));

export const isLabelButton = (obj: object): obj is LabelButton => 
    Boolean(Object.hasOwn(obj, "label") && Object.hasOwn(obj, "onClicked"));

/** Communicate with the music player */
@register({ GTypeName: "VibeAPI" })
export default class Vibe extends GObject.Object {
    private static instance: Vibe;

    #lastId: number = -1;
    #song: Song|null = null;
    #state: PlayerState = PlayerState.NONE;

    public static readonly runtimeDir = Gio.File.new_for_path(`${GLib.get_user_runtime_dir()}/vibe`);
    public static readonly cacheDir = Gio.File.new_for_path(`${GLib.get_user_cache_dir()}/vibe`);
    public static readonly dataDir = Gio.File.new_for_path(`${GLib.get_user_data_dir()}/vibe`);
    public static readonly pluginsDir = Gio.File.new_for_path(`${this.dataDir}/plugins`);
    public static readonly pluginsCacheDir = Gio.File.new_for_path(`${this.cacheDir}/plugins`);

    /** currently playing song, can be null if there's none */
    @getter(gtype<Song|null>(Song))
    get song() { return this.#song; }

    @getter(gtype<PlayerState>(Number))
    get state() { return this.#state; }

    /** generate an unique identifier for an object(song, playlist, artist, album...) */
    public generateID(): number {
        this.#lastId++;
        return this.#lastId;
    }

    public static getDefault(): Vibe {
        if(!this.instance)
            this.instance = new Vibe();

        return this.instance;
    }

    public static setDefault(inst: Vibe): void {
        if(!this.instance) {
            this.instance = inst;
            return;
        }

        throw new Error("Vibe: Can't set default instance if it was previously set! (readonly)");
    }

    constructor() {
        super();
    }
}
