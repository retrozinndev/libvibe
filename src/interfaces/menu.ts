import { LabelButton } from "..";


export interface Menu {
    get length(): number;

    /** append a new button to the end of the menu
      * @returns the id of the button */
    append(): number;

    /** prepends a new button to the start of the menu
      * @returns the id of the button */
    prepend(): number;

    /** remove a specific button by its `id` from the menu
      * @returns `true` if the button was removed successfully, false if else */
    remove(id: number): boolean;

    /** transform the list of buttons to an array.
      * @returns `Array<LabelButton>` */
    toArray(): Array<LabelButton>;
}
