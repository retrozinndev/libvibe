import Gtk from "gi://Gtk?version=4.0";
import { Page } from "./page";



export interface PagesSignalSignatures extends Gtk.Stack.SignalSignatures {
    /** a new page was added to the app's pages stack */
    "added": (page: Page) => void;
    /** a page got removed when the user hit the back button */
    "removed": (removedPage: Page) => void;
}

export interface Pages extends Gtk.Stack {
    // types
    $signals: PagesSignalSignatures;

    
    // properties
    /** current app's stack page */
    page: Page;

    
    // signals
    pageAdded(page: Page): void;
    pageRemoved(removedPage: Page): void;


    // methods
    /** add a new page to the stack */
    addPage(page: Page): void;

    /** go back to the previous stack's page */
    back(): void;

    connect<S extends keyof PagesSignalSignatures>(
        signal: S,
        callback: PagesSignalSignatures[S]
    ): number;

    emit<S extends keyof PagesSignalSignatures>(
        signal: S,
        ...params: Parameters<PagesSignalSignatures[S]>
    ): void;
}
