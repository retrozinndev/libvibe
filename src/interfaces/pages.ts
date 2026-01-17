import Gtk from "gi://Gtk?version=4.0";
import { Page } from "./page";



export interface PagesSignalSignatures extends Gtk.Stack.SignalSignatures {
    /** a new page was added to the app's page stack */
    "added": (page: Page) => void;
    /** a page got removed (back button or internal) */
    "removed": (removedPage: Page) => void;
    "notify::current-page": () => void;
    "notify::history": () => void;
}

export interface Pages extends Gtk.Stack {
    // types
    $signals: PagesSignalSignatures;

    
    // properties
    /** current app's stack page */
    get currentPage(): Page;

    /** page stack history (doesn't include current, old-to-newest order, pages get removed from history when they're single) */
    get history(): Array<Page>;


    // methods
    /** add a new page to the stack */
    add(page: Page): void;

    /** go back to the previous stack page */
    back(): void;

    connect<
        S extends keyof PagesSignalSignatures,
        C extends PagesSignalSignatures[S]
    >(
        signal: S,
        callback: (self: Pages, ...params: Parameters<C>) => ReturnType<C>
    ): number;

    emit<S extends keyof PagesSignalSignatures>(
        signal: S,
        ...params: Parameters<PagesSignalSignatures[S]>
    ): void;
}
