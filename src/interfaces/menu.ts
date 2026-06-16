import GObject from "gi://GObject?version=2.0";
import { LabelButton } from "..";


export interface Menu {
    readonly $signals: Menu.SignalSignatures;
    readonly $readableProperties: Menu.ReadableProperties;
    readonly $constructOnlyProperties: Menu.ConstructOnlyProperties;

    get length(): number;

    /** append a new button to the end of the menu
      * 
      * @param button to be added to the menu
      * @returns the id of the button */
    append(button: LabelButton): number;

    /** prepends a new button to the start of the menu
      * 
      * @param button to be added to the menu
      * @returns the id of the button */
    prepend(button: LabelButton): number;

    /** remove a specific button by its `id` from the menu
      * @returns `true` if the button was removed successfully, false if else */
    remove(id: number): boolean;

    /** transform the list of buttons to an array.
      * @returns `Array<LabelButton>` */
    toArray(): Array<LabelButton>;
}

export namespace Menu {
    export interface SignalSignatures extends GObject.Object.SignalSignatures {
        "notify::length": () => void;

        "added": (button: LabelButton, index: number) => void;
        "removed": (button: LabelButton, index: number) => void;
    }

    export interface ReadableProperties extends GObject.Object.ReadableProperties {
        "length": number;
    }

    export interface ConstructOnlyProperties extends GObject.Object.ConstructOnlyProperties {
        "buttons": Array<LabelButton>;
    }
}
