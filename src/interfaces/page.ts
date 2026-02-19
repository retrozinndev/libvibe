import Adw from "gi://Adw?version=1";
import Gtk from "gi://Gtk?version=4.0";
import { DetailedButton, IconButton, LabelButton, Section } from "..";
import { Album, Artist, Playlist, Song } from "../objects";
import { Accessor } from "gnim";


export interface Page<
    T extends Page.Type = Gtk.Widget
> extends Adw.Bin {
    $signals: Page.SignalSignatures;

    readonly id: any;
    /** page title. @default "New page"(if no content is defined; else it's based on the content) */
    title: string;
    sections: Array<Section>;
    content: T;
    buttons: Array<IconButton|LabelButton|DetailedButton>;

    get_content_widget(): Gtk.Box;

    // types
    connect<
        S extends keyof Page.SignalSignatures,
        C extends Page.SignalSignatures[S]
    >(
        signal: S,
        callback: (self: Page<T>, ...params: Parameters<C>) => ReturnType<C>
    ): number;

    emit<S extends keyof Page.SignalSignatures>(
        signal: S,
        ...args: Parameters<Page.SignalSignatures[S]>
    ): void;
}

export namespace Page {
    export type Type = Artist|Song|Album|Playlist|Gtk.Widget;

    type BaseProps = {
        title?: string;
        id?: any;
    };
    export type ConstructorProps<T extends Page.Type> = T extends Gtk.Widget ?
        BaseProps & { content: Gtk.Widget; }
    : BaseProps & {
        content: NonNullable<T>;
        sections?: Array<Section>;
        buttons?: Array<IconButton|LabelButton|DetailedButton>;
    }

    export type AccessorizeProps<T extends ConstructorProps<T2>, T2 extends Page.Type> = Omit<{
        [K in keyof T]: T[K]|Accessor<T[K]>
    }, "id"|"content"> & {
        // here we put back non-bindable props
        id?: any;
        content: NonNullable<T2>
    };

    export interface SignalSignatures extends Adw.Bin.SignalSignatures {
        /** a content refresh was requested */
        "refresh": () => void;
    }
}
