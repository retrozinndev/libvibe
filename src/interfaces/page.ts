import Adw from "gi://Adw?version=1";
import Gtk from "gi://Gtk?version=4.0";
import { DetailedButton, IconButton, LabelButton, Section } from "..";
import { Album, Artist, Playlist, Song } from "../objects";
import { Accessor } from "gnim";


export interface Page<
    T extends Page.Type = Gtk.Widget
> extends Adw.Bin {
    readonly $signals: Page.SignalSignatures;
    readonly $readableProperties: Page.ReadableProperties;
    readonly $readWriteProperties: Page.ReadWriteProperties;

    readonly id: any;

    /** page title. @default "New page"(if no content is defined; else it's based on the content) */
    title: string;
    sections: Array<Section>;
    content: T;
    buttons: Array<IconButton|LabelButton|DetailedButton>;

    get_content_widget(): Gtk.Box;
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

    export type AccessorizeProps<T extends ConstructorProps<T2>, T2 extends Page.Type = Gtk.Widget> = Omit<{
        [K in keyof T]: T[K]|Accessor<T[K]>
    }, "id"|"content"> & {
        // here we put back non-bindable props
        id?: any;
        content: NonNullable<T2>
    };

    export interface SignalSignatures extends Adw.Bin.SignalSignatures {
        /** a content refresh was requested */
        "refresh"(): void;
    }

    export interface ConstructOnlyProperties extends Adw.Bin.ConstructOnlyProperties {
        id: any;
    }

    export interface ReadableProperties extends Adw.Bin.ReadableProperties {}

    export interface ReadWriteProperties extends Adw.Bin.ReadWriteProperties {
        title: string;
        sections: Array<Section>;
        content: Page.Type;
        buttons: Array<IconButton|LabelButton|DetailedButton>;
    }
}
