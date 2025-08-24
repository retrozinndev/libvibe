import GObject, { getter, property, register } from "gnim/gobject";
import Album from "./_album";
import Artist from "./_artist";
import Song from "./_song";


export type SearchResult = Album|Artist|Song;

@register({ GTypeName: "VibePlugin" })
export default class Plugin extends GObject.Object {

    readonly #name: string;
    readonly #implementsSearch: boolean = false;
    readonly #version: string = "unknown";

    @getter(String) 
    get name() { return this.#name; }

    @getter(String)
    get version() { return this.#version; }

    @getter(Boolean)
    get implementsSearch() { return this.#implementsSearch; }

    @property(String) 
    description: string = "A cool Plugin";


    constructor(properties: {
        name: string;
        description?: string;
        version?: string;
        implementsSearch?: boolean;
    }) {
        super();

        this.#name = properties.name;

        if(properties.description !== undefined)
            this.description = properties.description;

        if(properties.version !== undefined)
            this.#version = properties.version;

        if(properties.implementsSearch !== undefined)
            this.#implementsSearch = properties.implementsSearch;
    }

    /** the search function implemented by the plugin 
     * @param search the current search string
     * @returns an Array containing the search results or null
     */
    searchFunction(_search: string): Array<SearchResult>|null|undefined {
        return undefined;
    }
}
