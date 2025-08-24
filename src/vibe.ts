import GObject, { register } from "gnim/gobject";


/** Communicate with the music player */
@register({ GTypeName: "VibeAPI" })
export default class Vibe extends GObject.Object {
    #lastId: number = -1;

    /** generate an unique identifier for this instance */
    public generateID(): number {
        this.#lastId++;
        return this.#lastId;
    }
}
