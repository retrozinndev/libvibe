import Adw from "gi://Adw?version=1";
import Gtk from "gi://Gtk?version=4.0";
import { IconButton, LabelButton, Section } from "..";
import { Album, Artist, Playlist, Song } from "../objects";
import { Accessor } from "gnim";


export type PageType = Artist|Song|Album|Playlist|Gtk.Widget;

type BaseProps = {
    title?: string|Accessor<string>;
    id?: any;
};
export type PageProps<T extends PageType> = T extends Gtk.Widget ?
    BaseProps & { content: Gtk.Widget; }
: BaseProps & {
    content: NonNullable<T>;
    sections?: Array<Section>|Accessor<Array<Section>>;
    buttons?: Array<IconButton & LabelButton>|Accessor<Array<IconButton&LabelButton>>;
}

export interface Page<
    T extends PageType = Gtk.Widget
> extends Adw.Bin {
    readonly id: any;
    /** page title. @default "New page"(if no content is defined; else it's based on the content) */
    title: string;
    sections: Array<Section>;
    content: T;
    buttons: Array<IconButton & LabelButton>;

    get_content_widget(): Gtk.Box;
}
