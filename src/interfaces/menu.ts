import GObject from "gnim/gobject";
import { LabelButton } from "..";


export interface Menu {
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
        "added": (button: LabelButton, index: number) => void;
        "removed": (button: LabelButton, index: number) => void;
        "notify::length": (spec: GObject.ParamSpec<number>) => void;
    }

    export interface ConstructorProps extends GObject.Object.ConstructorProps {
        buttons: Array<LabelButton>;
    }
}
