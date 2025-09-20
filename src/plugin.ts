import GObject, { getter, ParamSpec, property, register } from "gnim/gobject";
import { Section } from "./vibe";
import Album from "./album";
import Artist from "./artist";
import Song from "./song";


export type PluginStatus = {
    "init": string;
    "load": string;
    "import": string;
    "ok": string;
    "none": string;
};

export type Implementations = Partial<{
    /** true if plugin implements the search feature */
    search: boolean;
    /** true if plugin implements the sections feature */
    sections: boolean;
}>;

/** create plugins and add functions to them */
@register({ GTypeName: "VibePlugin" })
export default class Plugin extends GObject.Object {

    declare $signals: GObject.Object.SignalSignatures & {
        /** emitted when the plugin has finished loading */
        "loaded": () => void;
        /** emitted when the plugin has finished importing(first-load/update only) */
        "imported": () => void;
    };
    /** the plugin's unique identifier, defined by the application 
    * on plugin import */
    public id: any;

    readonly #name: string;
    readonly #version: string = "unknown";
    readonly #url?: string;

    #implements: Implementations = {};
    #songs: Array<Song> = [];
    

    /** array containing all the songs in the plugin.
      * if the plugin functions like online music players, 
      * you don't need to provide data to the array.
      */
    @getter(Array<Song>)
    get songs() { return this.#songs; }

    /** the plugin name */
    @getter(String) 
    get name() { return this.#name; }

    /** the plugin's description */
    @property(String) 
    description: string = "A cool Plugin";

    /** the plugin's version in a string format, default: "unknown" */
    @getter(String)
    get version() { return this.#version; }

    /** the plugin's website, can be null */
    @getter(String)
    get url() { return this.#url!; }

    /** an object containing which functions are implemented in 
      * this plugin
      */
    @getter(Object as unknown as ParamSpec<Implementations>)
    get implements() { return this.#implements; }

    /** the plugin's status, you can set this to the available 
    * values through completion anytime. default: "none" */
    @property(String as unknown as ParamSpec<keyof PluginStatus>) // fake-type (lol) because it's all a string in the end
    status: keyof PluginStatus = "none";

    constructor(properties: {
        name: string;
        description?: string;
        version?: string;
        url?: string;
        implements?: Implementations
    }) {
        super();

        this.#name = properties.name;
        this.#url = properties.url;

        if(properties.description !== undefined)
            this.description = properties.description;

        if(properties.version !== undefined)
            this.#version = properties.version;

        if(properties.implements !== undefined)
            this.#implements = Object.freeze({ ...properties.implements });
    }

    protected addSong(song: Song): void {
        this.#songs.push(song);
        this.notify("songs");
    }

    /** the search function implemented by the plugin.
     * @param _search the current search string
     * @returns an Array containing the search results or null
     */
    search(_search: string): Array<Array<Section>|Array<Album|Artist|Song>>|null {
        return null;
    }

    /** the plugin's section generator. sections are widgets with an
    * attractive title and maybe a description; with song/album 
    * suggestions.
    * 
    * @param _length the number of sections to generate, usually provided
    * by the application. can be undefined
    *
    * @returns an array containing all the sections, or null if not
    * implemented
    * */
    getSections(_length?: number): Array<Section>|null {
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
