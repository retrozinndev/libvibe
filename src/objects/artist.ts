import GObject, { getter, gtype, property, register } from "gnim/gobject";
import { Vibe } from "..";
import { Plugin } from "../plugin";
import { Image } from "../utils";
import { VibeObject } from "./object";


/** store artist informations */
@register({ GTypeName: "VibeArtist" })
export class Artist extends VibeObject {
    declare $signals: Artist.SignalSignatures;

    readonly #name: string = "Unknown Artist";
    readonly #displayName: string|null = null;
    readonly #description: string|null = null;
    readonly #url: string|null = null;

    /** the artist's name.
    * if display name is provideable, use this property for the user name
    * and :display-name for the artist's display name(pretty name)
    *
    * @default "Unknown Artist"
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
    @property(gtype<Image|null>(GObject.Object))
    image: Image|null = null;

    constructor(properties: {
        name?: string;
        displayName?: string;
        image?: Image;
        plugin?: Plugin;
        id?: any;
        url?: string;
        description?: string;
    }) {
        super({
             id: properties.id,
             plugin: properties.plugin
        });

        if(properties.name !== undefined)
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
