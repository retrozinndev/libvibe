import GObject, { getter, ParamSpec, property, register } from "gnim/gobject";
import Album from "./_album";
import Artist from "./_artist";
import Song from "./_song";
import { Section } from "./vibe";


export type PluginStatus = {
    "init": string;
    "load": string;
    "import": string;
    "ok": string;
    "none": string;
};

/** create plugins and add functions to them */
@register({ GTypeName: "VibePlugin" })
export default class Plugin extends GObject.Object {

    /** the plugin's unique identifier, defined by the application 
    * on plugin import */
    public id: any;

    readonly #name: string;
    readonly #implementsSearch: boolean = false;
    readonly #implementsSections: boolean = false;
    readonly #version: string = "unknown";
    readonly #url?: string;

    /** the plugin name */
    @getter(String) 
    get name() { return this.#name; }

    /** the plugin's description */
    @property(String) 
    description: string = "A cool Plugin";

    /** the plugin's version in a string format, default: "unknown" */
    @getter(String)
    get version() { return this.#version; }

    /** true if plugin implements the search feature */
    @getter(Boolean)
    get implementsSearch() { return this.#implementsSearch; }

    /** true if plugin implements the sections feature */
    @getter(Boolean)
    get implementsSections() { return this.#implementsSections; }

    /** the plugin's website, can be null */
    @getter(String)
    get url() { return this.#url!; }

    /** the plugin's status, you can set this to the available 
    * values through completion anytime. default: "none" */
    @property(String as unknown as ParamSpec<keyof PluginStatus>) // fake-type (lol) because it's all a string in the end
    status: keyof PluginStatus = "none";


    constructor(properties: {
        name: string;
        description?: string;
        version?: string;
        url?: string;
        implementsSearch?: boolean;
        implementsSections?: boolean;
    }) {
        super();

        this.#name = properties.name;
        this.#url = properties.url;

        if(properties.description !== undefined)
            this.description = properties.description;

        if(properties.version !== undefined)
            this.#version = properties.version;

        if(properties.implementsSearch !== undefined)
            this.#implementsSearch = properties.implementsSearch;

        if(properties.implementsSections !== undefined)
            this.#implementsSections = properties.implementsSections;
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
}
