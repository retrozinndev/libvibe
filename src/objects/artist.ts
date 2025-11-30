import GdkPixbuf from "gi://GdkPixbuf?version=2.0";
import GObject, { getter, gtype, property, register } from "gnim/gobject";
import { Vibe } from "..";
import { Plugin } from "../plugin";


/** store artist informations */
@register({ GTypeName: "VibeArtist" })
export class Artist extends GObject.Object {
    declare $signals: Artist.SignalSignatures;
    /** the unique identifier for this artist in this plugin */
    readonly id: any;

    readonly #name: string;
    readonly #displayName: string|null = null;
    readonly #description: string|null = null;
    readonly #url: string|null = null;

    /** the artist's name.
    * if display name is provideable, use this property for the user name
    * and :display-name for the artist's display name(pretty name)
    * */
    @getter(String)
    get name() { return this.#name; };

    /** the artist's display name, can be null */
    @getter(gtype<string|null>(String))
    get displayName() { return this.#displayName; }

    /** the artist's description, can be null */
    @getter(gtype<string|null>(String))
    get description() { return this.#description; }

    /** the artist's url, can be null.
    * you can set this as the artist's profile page or their website
    * */
    @getter(gtype<string|null>(String))
    get url() { return this.#url; }

    /** the artist's picture, in pixbuf. can be null */
    @property(gtype<GdkPixbuf.Pixbuf|null>(GdkPixbuf.Pixbuf))
    image: GdkPixbuf.Pixbuf|null = null;

    constructor(properties: {
        name: string;
        displayName?: string;
        image?: GdkPixbuf.Pixbuf;
        plugin?: Plugin;
        id?: any;
        url?: string;
        description?: string;
    }) {
        super();

        this.id = properties.id ?? Vibe.getDefault().generateID();
        this.#name = properties.name;

        if(properties.displayName !== undefined)
            this.#displayName = properties.displayName;

        if(properties.description !== undefined)
            this.#description = properties.description;

        if(properties.image !== undefined)
            this.image = properties.image;

        if(properties.plugin)
            Vibe.getDefault().emit(
                "artist-added",
                properties.plugin,
                this
            );
    }
}

export namespace Artist {
    export interface SignalSignatures extends GObject.Object.SignalSignatures {
        "notify::name": () => void;
        "notify::display-name": () => void;
        "notify::image": () => void;
        "notify::url": () => void;
    }
}
