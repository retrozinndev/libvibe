import Gtk from "gi://Gtk?version=4.0";
import { Page } from "./page";


export interface Pages extends Gtk.Stack {
    readonly $signals: Pages.SignalSignatures;
    readonly $readableProperties: Pages.ReadableProperties;
    readonly $readWriteProperties: Pages.ReadWriteProperties;

    
    // properties
    /** current app's stack page */
    get currentPage(): Page;

    /** page stack history (doesn't include current, old-to-newest order, pages get removed from history when they're single) */
    get history(): Array<Page>;

    /** `true` if the user can go back to the previous page, or else `false` */
    get canGoBack(): boolean;


    // methods
    /** add a new page to the stack */
    add<T extends Page.Type>(page: Page<T>): void;

    /** go back to the previous stack page */
    back(): void;
}

export namespace Pages {
    export interface SignalSignatures extends Gtk.Stack.SignalSignatures {
        /** a new page was added to the app's page stack */
        "added": <T extends Page.Type>(page: Page<T>) => void;
        /** a page got removed (back button or internal) */
        "removed": <T extends Page.Type>(removedPage: Page<T>) => void;
        "notify::current-page": () => void;
        "notify::history": () => void;
    }

    export interface ReadableProperties extends Gtk.Stack.ReadableProperties {
        "current-page": Page;
        "history": Array<Page>;
        "can-go-back": boolean;
    }
    export interface ReadWriteProperties extends Gtk.Stack.ReadWriteProperties {
    }
}
