import GObject, { getter, ParamSpec, register } from "gnim/gobject";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import Plugin from "./plugin";
import Song from "./song";


export type IconButton = {
    iconName: string;
    onClicked?: () => void;
};

export type LabelButton = {
    label: string;
    onClicked?: () => void;
};

export type Section = {
    title: string;
    description?: string;
    type?: "listrow"|"row";
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

export const isIconButton = (obj: object): boolean =>
    Boolean(Object.hasOwn(obj, "iconName") && Object.hasOwn(obj, "onClicked"));

export const isLabelButton = (obj: object): boolean => 
    Boolean(Object.hasOwn(obj, "label") && Object.hasOwn(obj, "onClicked"));

/** Communicate with the music player */
@register({ GTypeName: "VibeAPI" })
export default class Vibe extends GObject.Object {
    private static instance: Vibe;

    #lastId: number = -1;
    #song: Song|null = null;
    #runtimeDir: Gio.File = Gio.File.new_for_path(`${GLib.get_user_runtime_dir()}/vibe`);
    #service: Gio.SocketService;
    #state: PlayerState = PlayerState.NONE;

    /** currently playing song, can be null if there's none */
    @getter(Song as unknown as ParamSpec<Song|null>)
    get song() { return this.#song; }

    @getter(Number as unknown as ParamSpec<PlayerState>) // just for completion purposes
    get state() { return this.#state; }

    /** generate an unique identifier for this instance */
    public generateID(): number {
        this.#lastId++;
        return this.#lastId;
    }

    public static getDefault(): Vibe {
        if(!this.instance)
            this.instance = new Vibe();

        return this.instance;
    }

    constructor() {
        super();

        const exists = GLib.file_test(
            `${this.#runtimeDir.get_path()!}/socket.sock`, 
            GLib.FileTest.EXISTS
        );

        if(!exists) 
            throw new Error(`Vibe Socket: Couldn't connect to socket!`);

        this.#service = Gio.SocketService.new();
        this.#service.add_address(Gio.UnixSocketAddress.new(
                `${this.#runtimeDir.get_path()!}/socket.sock`
            ),
            Gio.SocketType.STREAM,
            Gio.SocketProtocol.DEFAULT,
            null
        );
    }

    public checkIsPlugin(obj: object): boolean {
        return obj instanceof Plugin;
    }

    private sendCommand(command: "play"|"pause"|"next"|"previous"): void {} //TODO
}
