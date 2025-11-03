import GObject, { getter, gtype, property, register } from "gnim/gobject";
import Artist from "./artist";
import Song from "./song";
import SongList from "./songlist";
import Vibe, { Section } from "./vibe";


export type PluginStatus = {
    "init": string;
    "load": string;
    "import": string;
    "ok": string;
    "none": string;
};

export type Update = {
    /** the new updated version number.
      * @example 1.2.1 (previous was 1.2.0) */
    newVersion: string;
    /** the link where the GET request should be made to get the updated plugin */
    downloadUrl?: string;
    /** the link for the user to download the new plugin version.
      * (use this if you don't want to implement the plugin update directly) */
    dowloadLink?: string;
};

export type Implementations = Partial<{
    /** whether the plugin implements the search feature or not */
    search: boolean;
    /** wheter this plugin implements the sections feature or not */
    sections: boolean;
    /** wheter this plugin supports creating playlists or not */
    playlist: boolean;
    /** whether the plugin implements an update system */
    updates: boolean;
}>;

export type PluginSignalSignatures = GObject.Object.SignalSignatures & {
    /** emitted when the plugin has finished loading */
    "loaded": () => void;
    /** emitted when the plugin has finished importing(first-load/update only) */
    "imported": () => void;
    "notify::description": (description: string) => void;
    "notify::status": (status: PluginStatus) => void;
};


/** create plugins and add functions to them */
@register({ GTypeName: "VibePlugin" })
class Plugin extends GObject.Object {
    declare $signals: PluginSignalSignatures;

    /** the plugin's unique identifier, defined by the application 
      * on plugin import 
      * @default undefined */
    public readonly id: any;

    readonly #name: string;
    readonly #prettyName: string;
    readonly #version: string = "unknown";
    readonly #url: string|null = null;

    #implements: Implementations = {};
    #songlist: SongList = new SongList();
    

    /** SongList containing all the songs imported by the plugin.
      * if the plugin functions like online music players(network streaming), 
      * you don't need to add them to the list.
      * You can add/remove songs by using this field.
      * @readonly
      */
    @getter(SongList) 
    get songlist() { return this.#songlist; }

    /** the plugin's unique name. e.g.: vibe-plugin-music
    * @readonly */
    @getter(String) 
    get name() { return this.#name; }

    /** pretty name for the plugin. e.g.: 
      * name: vibe-plugin-music, prettyName: Music 
      * defaults to the name of the plugin if not set */
    @getter(String)
    get prettyName() { return this.#prettyName; }

    /** the plugin's description
    * @default "A cool Plugin" */
    @property(String) 
    description: string = "A cool Plugin";

    /** the plugin's version in a string format 
    * @default "unknown" */
    @getter(String)
    get version() { return this.#version; }

    /** the plugin's website, can be null 
    * @readonly */
    @getter(gtype<string|null>(String))
    get url() { return this.#url; }

    /** an object containing which functions are implemented in 
      * this plugin
      * @readonly
      */
    @getter(gtype<Implementations>(Object))
    get implements() { return this.#implements; }

    /** the plugin's status, you can set this to the available 
      * values through completion anytime. 
      * @default "none" */
    @property(gtype<keyof PluginStatus>(String)) // fake-type (lol) because it's all a string in the end
    status: keyof PluginStatus = "none";

    constructor(properties: {
        name: string;
        prettyName?: string;
        description?: string;
        version?: string;
        url?: string;
        implements?: Implementations;
    }) {
        super();

        this.id = Vibe.getDefault().generateID();
        this.#name = properties.name;
        this.#prettyName = properties.prettyName ?? properties.name;

        if(properties.url !== undefined)
            this.#url = properties.url;

        if(properties.description !== undefined)
            this.description = properties.description;

        if(properties.version !== undefined)
            this.#version = properties.version;

        if(properties.implements !== undefined)
            this.#implements = Object.freeze({ ...properties.implements });
    }

    /** the search function implemented by the plugin.
     * @param _search the current search string
     * @returns an Array containing the search results or null
     */
    search(search: string): Promise<Array<Song|Artist|SongList|Section>|null>|Array<Song|Artist|SongList|Section>|null {
        return null;
    }

    /** the plugin's section generator. sections are widgets with an
    * attractive title and maybe a description; with song/album 
    * suggestions.
    * 
    * @param length the number of sections to generate, usually provided
    * by the application. can be undefined
    *
    * @param offset the offset to load the next sections. usually it's the 
    * index of the last loaded section.
    *
    * @returns an array containing all the sections, or null if not
    * implemented
    */
    getSections(length?: number, offset?: number): Promise<Array<Section>|null>|Array<Section>|null {
        return null;
    }

    /** function that checks for updates for the plugin(if implemented).
      * this is called by the application when the plugin initializes/the user checks for updates.
      * @returns an Update object if an update was found, or null if none */
    getUpdates(): Promise<Update|null>|null {
        return null;
    }

    public emit<Signal extends keyof typeof this.$signals>(
        signal: Signal, 
        ...args: Parameters<(typeof this.$signals)[Signal]>
    ): void {
        super.emit(signal, ...args);
    }

    public connect<Signal extends keyof typeof this.$signals>(
        signal: Signal, 
        callback: (self: typeof this, ...args: Parameters<(typeof this.$signals)[Signal]>) => ReturnType<
            (typeof this.$signals)[Signal]
        >
    ): number {
        return super.connect(signal, callback);
    }

    /** check if a feature is implemented for this plugin.
      * @returns true if feature is implemented by the plugin
      */
    isImplemented<Feature extends keyof Implementations>(feature: Feature): boolean {
        return Boolean(this.#implements[feature]);
    }
}

export default Plugin;
