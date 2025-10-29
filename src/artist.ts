import GdkPixbuf from "gi://GdkPixbuf?version=2.0";
import GObject, { getter, ParamSpec, register } from "gnim/gobject";
import Vibe from "./vibe";


/** store artist informations */
@register({ GTypeName: "VibeArtist" })
export default class Artist extends GObject.Object {
    /** the unique identifier for this artist in this plugin */
    readonly id: any;

    readonly #name: string;
    readonly #displayName: string|null = null;
    readonly #description: string|null = null;
    readonly #image: GdkPixbuf.Pixbuf|null = null;
    readonly #url: string|null = null;

    /** the artist's name.
    * if display name is provideable, use this property for the user name
    * and :display-name for the artist's display name(pretty name)
    * */
    @getter(String)
    get name() { return this.#name; };

    /** the artist's display name, can be null */
    @getter(String as unknown as ParamSpec<string|null>)
    get displayName() { return this.#displayName; }

    /** the artist's description, can be null */
    @getter(String as unknown as ParamSpec<string|null>)
    get description() { return this.#description; }

    /** the artist's url, can be null.
    * you can set this as the artist's profile page or their website
    * */
    @getter(String as unknown as ParamSpec<string|null>)
    get url() { return this.#url; }

    /** the artist's picture, in pixbuf. can be null */
    @getter(GdkPixbuf.Pixbuf as unknown as ParamSpec<GdkPixbuf.Pixbuf|null>)
    get image() { return this.#image; }

    constructor(properties: {
        name: string;
        displayName?: string;
        image?: GdkPixbuf.Pixbuf;
        url?: string;
        description?: string;
    }) {
        super();

        this.id = Vibe.getDefault().generateID();
        
        this.#name = properties.name;
        this.#displayName = properties.displayName ?? null;
        this.#description = properties.description ?? null;
        this.#image = properties.image ?? null;
    }
}
