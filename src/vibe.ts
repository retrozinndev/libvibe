import GObject, { register } from "gnim/gobject";


export type IconButton = {
    iconName: string;
    onClicked?: () => void;
};

export type LabelButton = {
    label: string;
    onClicked?: () => void;
};

export type Section = {
    title: string;
    description?: string;
    type?: "listrow"|"row";
    headerButtons?: Array<IconButton|LabelButton>;
    endButton?: IconButton|LabelButton;
};

export const isIconButton = (obj: object): boolean =>
    Object.hasOwn(obj, "iconName") && Object.hasOwn(obj, "onClicked");

export const isLabelButton = (obj: object): boolean => 
    Object.hasOwn(obj, "label") && Object.hasOwn(obj, "onClicked");

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
