import GObject, { getter, ParamSpec, register } from "gnim/gobject";


/** store artist informations */
@register({ GTypeName: "VibeArtist" })
export default class Artist extends GObject.Object {

    public static ArrayParamSpec = (name: string, flags: GObject.ParamFlags) =>
        GObject.ParamSpec.jsobject(name, null, null, flags) as ParamSpec<Array<Artist>>;

    public static ParamSpec = (name: string, flags: GObject.ParamFlags) => 
        GObject.ParamSpec.jsobject(name, null, null, flags) as ParamSpec<Artist>;

    /** the unique identifier for this artist in this plugin */
    readonly id: any;

    readonly #name: string;
    readonly #url: string|null = null;
    readonly #description: string|null = null;
    readonly #displayName: string|null = null;

    /** the artist's name.
    * if display name is provideable, use this property for the user name
    * and :display-name for the artist's display name(pretty name)
    * */
    @getter(String)
    get name() { return this.#name; };

    /** the artist's display name, can be null */
    @getter(String)
    get displayName() { return this.#displayName!; }

    /** the artist's description, can be null */
    @getter(String)
    get description() { return this.#description!; }

    /** the artist's url, can be null.
    * you can set this as the artist's profile page or their website
    * */
    @getter(String)
    get url() { return this.#url!; }

    constructor(properties: {
        name: string;
        displayName?: string;
        url?: string;
        description?: string;
    }) {
        super();
        
        this.#name = properties.name;
        this.#displayName = properties.displayName ?? null;
        this.#description = properties.description ?? null;
    }
}
