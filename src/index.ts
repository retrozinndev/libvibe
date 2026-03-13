import GObject, { getter, gtype, register, signal } from "gnim/gobject";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import { SongList, Song, Artist, Album, Playlist } from "./objects";
import { Media } from "./interfaces/media";
import { Plugin } from "./plugin";
import { Pages } from "./interfaces/pages";
import { Page, Dialog } from "./interfaces";
import { createRoot, getScope, jsx } from "gnim";
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

export type DetailedButton = IconButton&LabelButton;

export type Section = {
    title: string;
    description?: string;
    type?: "listrow"|"row";
    content?: Array<Song|SongList|Artist>;
    headerButtons?: Array<IconButton | LabelButton>;
    endButton?: IconButton | LabelButton;
};

export const isIconButton = (obj: object): obj is IconButton =>
    Boolean(Object.hasOwn(obj, "iconName") && Object.hasOwn(obj, "onClicked"));

export const isLabelButton = (obj: object): obj is LabelButton => 
    Boolean(Object.hasOwn(obj, "label") && Object.hasOwn(obj, "onClicked"));

export const isDetailedButton = (obj: object): obj is DetailedButton => 
    isIconButton(obj) && isLabelButton(obj);

/** Communicate with the music player and do more stuff, like:
  * - connect to signals for detecting user actions or player events
  * - retrieve the currently-playing song via the `media` instance available in the class
  * - add dialogs or toast notifications for the user to interact with 
  * - add a new page to the application stack by using an object template or your own widget
  * - search through existing objects like songs, artists, albums and playlists */
@register({ GTypeName: "VibeAPI" })
export class Vibe extends GObject.Object {
    declare $signals: Vibe.SignalSignatures;

    private static instance: Vibe;

    #isDataSet: boolean = false;
    #window!: Adw.ApplicationWindow;
    #pages!: Pages;
    #pageConstructor!: Vibe.PageConstructor;
    #dialogConstructor!: Vibe.DialogConstructor;
    #media!: Media;
    #toastOverlay!: Adw.ToastOverlay;
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
    
    public static readonly runtimeDir = Gio.File.new_for_path(`${GLib.get_user_runtime_dir()}/vibe`);
    public static readonly cacheDir = Gio.File.new_for_path(`${GLib.get_user_cache_dir()}/vibe`);
    public static readonly dataDir = Gio.File.new_for_path(`${GLib.get_user_data_dir()}/vibe`);
    public static readonly pluginsDir = Gio.File.new_for_path(`${this.dataDir.peek_path()!}/plugins`);
    public static readonly pluginsCacheDir = Gio.File.new_for_path(`${this.cacheDir.peek_path()!}/plugins`);


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

    @signal(String, gtype<Vibe.ToastPriority>(String), gtype<LabelButton|undefined>(Object))
    protected toastNotified(_: string, __: Vibe.ToastPriority, ___?: LabelButton) {}

    @signal([gtype<Song|Artist|Album|Playlist|SongList>(GObject.Object)], Array<LabelButton>, {
        
    })
    protected menuRequest(_: Song|Artist|Album|Playlist|SongList) { return []; }

    @signal(gtype<Page>(GObject.Object))
    protected pageRequest(_: Page) {}

    @signal()
    protected initialized() {}

    @signal(GObject.Object, GObject.Object)
    protected songAdded(plugin: Plugin, song: Song) {
        this.#songs.push({
            plugin: plugin,
            song: song
        });

        this.notify("songs");
    }

    @signal(GObject.Object, GObject.Object)
    protected albumAdded(plugin: Plugin, album: Album) {
        this.#albums.push({
            plugin: plugin,
            album: album
        });

        this.notify("albums");
    }

    @signal(GObject.Object, GObject.Object)
    protected songlistAdded(plugin: Plugin, list: SongList) {
        this.#songlists.push({
            plugin: plugin,
            list: list
        });

        this.notify("songlists");
    }
    
    @signal(GObject.Object, GObject.Object)
    protected artistAdded(plugin: Plugin, artist: Artist) {
        this.#artists.push({
            plugin: plugin,
            artist: artist
        });

        this.notify("artists");
    }

    @signal(GObject.Object)
    protected pluginAdded(plugin: Plugin) {
        this.#plugins.push(plugin);
        this.notify("plugins");
    }

    @signal(GObject.Object, GObject.Object)
    protected playlistAdded(plugin: Plugin, list: Playlist) {
        this.#playlists.push({
            plugin: plugin,
            playlist: list
        });
    }

    @signal(GObject.Object)
    protected authStarted(_: Plugin) {}

    @signal(GObject.Object)
    protected authEnded(_: Plugin) {}


    constructor() {
        super();

        if(!Vibe.instance)
            Vibe.instance = this;
    }

    /** generate an unique identifier for an object(song, playlist, artist, album...) */
    public generateID(): number {
        this.#lastId++;
        return this.#lastId;
    }

    public static getDefault(): Vibe {
        if(!this.instance)
            throw new Error("No instance of VibeAPI(Vibe) was created yet. \
Please create one providing all the necessary properties");

        return this.instance;
    }

    /** add a new page to the stack. plugins can use this to open details for artists, 
      * songs, playlists, albums and even custom pages */
    public addPage<T extends Page.Type>(props: Page.AccessorizeProps<Page.ConstructorProps<T>, T>): void {
        createRoot(() => {
            // @ts-ignore
            const page = jsx(this.#pageConstructor, props),
                scope = getScope();

            const id = page.connect("destroy", () => {
                page.disconnect(id);
                scope.dispose();
            });
            this.#pages.add(page as Page);
        });
    }

    /** send a small toast notification to the UI. 
      * 
      * @param text string containing what you want to notify the user
      * @param priority the priority of the notification. can be "high" or "normal"
      * @param button action button to go with the notification. you can leave this empty if you want none
      *
      * @example notify the user that there's no internet connection */
    public toastNotify(text: string, priority: Vibe.ToastPriority = "normal", button?: LabelButton): void {
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
            const actionConn: number = action.connect("activate", () => {
                action.disconnect(actionConn);
                button.onClicked?.();
            });
            const clickConn: number = toast.connect("button-clicked", () => {
                toast.disconnect(clickConn);
                action.activate();
            });

            toast.set_button_label(button.label);
        }

        this.#toastOverlay.add_toast(toast);
        this.emit("toast-notified", text, priority, button);
    }

    /** adds a dialog popup to the main application window and presents it
      * 
      * @param dialog its own properties */
    public addDialog(dialog: Dialog): void {
        const diag = new this.#dialogConstructor(dialog);

        diag.set_presentation_mode(Adw.DialogPresentationMode.AUTO);
        diag.present(this.#window); // so it uses the new popup style
    }

    /** set data for the VibeAPI to work correctly.
      * these data are instances of widgets and class implementations of interfaces for the API to work with. 
      * you don't need to set this, as it's set automatically by the application. */
    public setData(
        media: Media, 
        pages: Pages, 
        pageConstructor: new <T extends Page.Type>(props: Page.ConstructorProps<T>) => Page<T>,
        toastOverlay: Adw.ToastOverlay,
    ): void {
        if(this.#isDataSet) {
            console.error("Data was already set, this call was skipped");
            return;
        }

        this.#media = media;
        this.#pages = pages;
        this.#pageConstructor = pageConstructor;
        this.#toastOverlay = toastOverlay;

        this.#isDataSet = true;
    }

    public setDialogConstructor(construct: Vibe.DialogConstructor): void {
        if(this.#dialogConstructor)
            return;

        this.#dialogConstructor = construct;
    }

    /** sets the main application window where to add dialogs to.
      * this is automatically set on application initialization, so don't worry. */
    public setApplicationWindow(window: Adw.ApplicationWindow): void {
        if(this.#window)
            return;

        this.#window = window;
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

namespace Vibe {
    export type ToastPriority = "high"|"normal";   
    export type PageConstructor = new <T extends Page.Type>(props: Page.ConstructorProps<T>) => Page<T>;
    export type DialogConstructor = new (props: Dialog) => Adw.Dialog;

    export interface SignalSignatures extends GObject.Object.SignalSignatures {
        /** the api just finished starting */
        "initialized": () => void;
        /** a new song object was generated */
        "song-added": <T extends Object>(plugin: Plugin, song: Song<T>) => void;
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
        /** a new toast notification got sent */
        "toast-notified": (text: string, priority: Vibe.ToastPriority, button?: LabelButton) => void;
        /** a menu was requested by the user(e.g.: a secondary click in a song).
          * this is a plugin-wide signal. it's emitted by all of the plugins;
          * you can detect which plugin emitted the signal by accessing the `plugin` field of the `object`
          * for a plugin-specific signal, refer to using `Plugin`'s `::menu-request`
          *
          * @param object the object that is requesting the secondary menu(song, artist...)
          * @returns an array of buttons to be added to the menu */
        "menu-request": (object: Song|Album|Artist|Playlist|SongList) => Array<LabelButton>;
    }
}
