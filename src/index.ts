import GObject, { getter, gtype, register, signal } from "gnim/gobject";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import { SongList, Song, Artist, Album, Playlist } from "./objects";
import { Media } from "./interfaces/media";
import { Plugin } from "./plugin";
import { Pages } from "./interfaces/pages";
import { Page, PageModal, PageProps } from "./interfaces";
import { createRoot, getScope } from "gnim";
import Adw from "gi://Adw?version=1";


export type IconButton = {
    id?: any;
    iconName: string;
    onClicked?: () => void;
};

export type LabelButton = {
    id?: any;
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

type PageConstructor = new <M extends PageModal>(props: PageProps<M>) => Page;

export const isIconButton = (obj: object): obj is IconButton =>
    Boolean(Object.hasOwn(obj, "iconName") && Object.hasOwn(obj, "onClicked"));

export const isLabelButton = (obj: object): obj is LabelButton => 
    Boolean(Object.hasOwn(obj, "label") && Object.hasOwn(obj, "onClicked"));

/** Communicate with the music player and do more stuff */
@register({ GTypeName: "VibeAPI" })
export class Vibe extends GObject.Object {
    private static instance: Vibe;

    declare $signals: GObject.Object.SignalSignatures & {
        /** the app and api just finished initializing/starting */
        "initialized": () => void;
        /** a new song object was generated */
        "song-added": (plugin: Plugin, song: Song) => void;
        /** a new album was generated */
        "album-added": (plugin: Plugin, album: Album) => void;
        /** a new song list was generated. it's also triggered by albums and playlists */
        "songlist-added": (plugin: Plugin, list: SongList) => void;
        /** new artist object instance was generated */
        "artist-added": (plugin: Plugin, artist: Artist) => void;
        /** a new plugin got installed by the user */
        "plugin-added": (plugin: Plugin) => void;
        /** a playlist was created */
        "playlist-added": (plugin: Plugin, playlist: Playlist) => void;
        /** authentication for a plugin has started */
        "auth-started": (plugin: Plugin) => void;
        /** authentication for a plugin has ended */
        "auth-ended": (plugin: Plugin) => void;
    };

    #pages: Pages;
    #pageConstructor: PageConstructor;
    #media: Media;
    #toastOverlay: Adw.ToastOverlay;
    #lastId: number = -1;
    #connections: Map<GObject.Object, Array<number>|number> = new Map();

    #plugins: Array<Plugin> = [];
    #songs: Array<{
        plugin: Plugin, 
        song: Song
    }> = [];
    #playlists: Array<{
        plugin: Plugin, 
        playlist: Playlist
    }> = [];
    #albums: Array<{
        plugin: Plugin,
        album: Album
    }> = [];
    #songlists: Array<{
        plugin: Plugin,
        list: SongList
    }> = [];
    #artists: Array<{
        plugin: Plugin,
        artist: Artist
    }> = [];


    /** control on adding new pages and going back to the previous
    * app's stack page */
    @getter(gtype<Pages>(GObject.Object))
    get pages() { return this.#pages; }

    @getter(gtype<Media>(GObject.Object))
    get media() { return this.#media; }

    @getter(Array)
    get songs() { return this.#songs; }

    @getter(Array)
    get playlists() { return this.#playlists; }

    @getter(Array)
    get albums() { return this.#albums; }

    @getter(Array)
    get songlists() { return this.#songlists; }

    @getter(Array)
    get artists() { return this.#artists; }

    @getter(Array)
    get plugins() { return this.#plugins; }


    @signal()
    initialized() {}

    @signal(Plugin, Song)
    songAdded(plugin: Plugin, song: Song) {
        this.#songs.push({
            plugin: plugin,
            song: song
        });

        this.notify("songs");
    }

    @signal(Plugin, Album)
    albumAdded(plugin: Plugin, album: Album) {
        this.#albums.push({
            plugin: plugin,
            album: album
        });

        this.notify("albums");
    }

    @signal(Plugin, SongList)
    songlistAdded(plugin: Plugin, list: SongList) {
        this.#songlists.push({
            plugin: plugin,
            list: list
        });

        this.notify("songlists");
    }
    
    @signal(Plugin, Artist)
    artistAdded(plugin: Plugin, artist: Artist) {
        this.#artists.push({
            plugin: plugin,
            artist: artist
        });

        this.notify("artists");
    }

    @signal(Plugin)
    pluginAdded(plugin: Plugin) {
        this.#plugins.push(plugin);
        this.notify("plugins");
    }

    @signal(Plugin, Playlist)
    playlistAdded(plugin: Plugin, list: Playlist) {
        this.#playlists.push({
            plugin: plugin,
            playlist: list
        });
    }

    @signal(Plugin)
    authStarted(_: Plugin) {}

    @signal(Plugin)
    authEnded(_: Plugin) {}

    public static readonly runtimeDir = Gio.File.new_for_path(`${GLib.get_user_runtime_dir()}/vibe`);
    public static readonly cacheDir = Gio.File.new_for_path(`${GLib.get_user_cache_dir()}/vibe`);
    public static readonly dataDir = Gio.File.new_for_path(`${GLib.get_user_data_dir()}/vibe`);
    public static readonly pluginsDir = Gio.File.new_for_path(`${this.dataDir.peek_path()!}/plugins`);
    public static readonly pluginsCacheDir = Gio.File.new_for_path(`${this.cacheDir.peek_path()!}/plugins`);
    

    constructor(
        media: Media, 
        pages: Pages, 
        pageConstructor: new (props: object) => Page,
        toastOverlay: Adw.ToastOverlay
    ) {
        super();

        this.#media = media;
        this.#pages = pages;
        this.#pageConstructor = pageConstructor;
        this.#toastOverlay = toastOverlay;
    }

    /** generate an unique identifier for an object(song, playlist, artist, album...) */
    public generateID(): number {
        this.#lastId++;
        return this.#lastId;
    }

    public static getDefault(): Vibe {
        if(!this.instance)
            throw new Error("No instance of VibeAPI(Vibe) was created yet. \
Please create one providing all the necessary properties")

        return this.instance;
    }

    public static setDefault(inst: Vibe): void {
        if(!this.instance) {
            this.instance = inst;
            return;
        }

        throw new Error("Vibe: Can't set default instance if it was previously set! (readonly)");
    }

    /** add a new page to the stack. plugins can use this to open details for artists, 
      * songs, playlists, albums and even custom pages */
    public addPage<M extends PageModal>(props: PageProps<M>): void {
        createRoot(() => {
            const page = new this.#pageConstructor(props),
                scope = getScope();

            const id = page.connect("destroy", () => {
                page.disconnect(id);
                scope.dispose();
            });
            this.#pages.addPage(page);
        });
    }

    /** send a small toast notification to the UI. 
      * 
      * @param text string containing what you want to notify the user
      * @param priority the priority of the notification. can be "high" or "normal"
      * @param button action button to go with the notification. you can leave this empty if you want none
      *
      * @example notify the user that there's no internet connection */
    public toastNotify(text: string, priority?: "high"|"normal", button?: LabelButton): void {
        const toast = new Adw.Toast({
            title: text,
            priority: priority === "high" ? 
                Adw.ToastPriority.HIGH
            : Adw.ToastPriority.NORMAL
        });

        if(button !== undefined) {
            const action = new Gio.SimpleAction({
                name: button.id ?? "toast.clicked",
                enabled: true
            });
            this.#connections.set(action, 
                action.connect("activate", () => button.onClicked?.())
            );

            toast.set_button_label(button.label);
        }

        this.#toastOverlay.add_toast(toast);
    }

    vfunc_dispose(): void {
        this.#connections.forEach((ids, gobj) => Array.isArray(ids) ?
            ids.forEach(id => gobj.disconnect(id))
        : gobj.disconnect(ids));
    }

    connect<
        S extends keyof typeof this.$signals,
        C extends (typeof this.$signals)[S]
    >(
        signal: S,
        callback: (self: typeof this, ...args: Parameters<C>) => ReturnType<C>
    ): number {
        return super.connect(signal, callback);
    }

    emit<Signal extends keyof typeof this.$signals>(
        signal: Signal,
        ...args: Parameters<(typeof this.$signals)[Signal]>
    ): void {
        super.emit(signal, ...args);
    }

    notify(prop: string): void;
    notify(prop: keyof typeof this): void;

    notify(prop: (keyof typeof this)|string): void {
        super.notify(prop as string);
    }
}
