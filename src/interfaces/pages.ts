import Gtk from "gi://Gtk?version=4.0";
import { Page } from "./page";



export interface Pages extends Gtk.Stack {
    /** add a new page to the stack */
    addPage(page: Page): void;

    /** go back to the previous stack's page */
    back(): void;
}
