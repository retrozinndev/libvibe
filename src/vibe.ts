import GObject, { getter, GType, ParamSpec, register } from "gnim/gobject";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
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

    $gtype = GObject.type_from_name("VibeAPI") as GType<Vibe>;

    #encoder = new TextEncoder();
    #lastId: number = -1;
    #song: Song|null = null;
    #client: Gio.SocketClient;
    #address: Gio.UnixSocketAddress;
    #state: PlayerState = PlayerState.NONE;
    #socketFile = Gio.File.new_for_path(`${Vibe.runtimeDir}/socket.sock`);

    public static readonly runtimeDir = Gio.File.new_for_path(`${GLib.get_user_runtime_dir()}/vibe`);
    public static readonly cacheDir = Gio.File.new_for_path(`${GLib.get_user_cache_dir()}/vibe`);
    public static readonly dataDir = Gio.File.new_for_path(`${GLib.get_user_data_dir()}/vibe`);
    public static readonly pluginsDir = Gio.File.new_for_path(`${this.dataDir}/plugins`);
    public static readonly pluginsCacheDir = Gio.File.new_for_path(`${this.cacheDir}/plugins`);

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

    /** @param socketAdress the vibe unix socket address */
    constructor(socketAdress?: Gio.UnixSocketAddress) {
        super();

        if(!this.#socketFile.query_exists(null)) 
            throw new Error(`Vibe Socket: Couldn't connect to socket!`);

        this.#client = Gio.SocketClient.new();
        this.#address = socketAdress ?? Gio.UnixSocketAddress.new(
            `${Vibe.runtimeDir.peek_path()!}/socket.sock`
        );
    }

    /** send commands to the vibe application through the unix socket 
    * @param command the command you want to use 
    * @param data the data you want to pass to the application (can be arguments for the command) */
    public sendCommand(command: "play"|"pause"|"next"|"previous", ...data: Array<any>): void {
        
        this.#client.connect_async(this.#address, null, (_, res) => {
            const conn = this.#client.connect_finish(res);
                
            conn.outputStream.write_bytes(
                this.#encoder.encode(`${command}>>${JSON.stringify(data)}`),
                null
            );

            return true;
        });
    }
}
