import Adw from "gi://Adw?version=1";
import Gtk from "gi://Gtk?version=4.0";
import { IconButton, LabelButton, Section } from "..";
import { Album, Artist, Playlist, Song } from "../objects";
import { Accessor } from "gnim";


export type PageType = Artist|Song|Album|Playlist|undefined;

export type Props = {
    title?: string|Accessor<string>;
    id?: any;
};

export type PageProps<T extends PageType = undefined> = T extends NonNullable<PageType> ?
    Props & {
        content: NonNullable<T>;
        sections?: Array<Section>|Accessor<Array<Section>>;
        buttons?: Array<IconButton & LabelButton>|Accessor<Array<IconButton&LabelButton>>;
    }
: Props

export interface Page<
    T extends PageType = undefined
> extends Adw.Bin {
    readonly id: any;
    /** page title. @default "New page"(if no content is defined; else it's based on the content) */
    title: string;
    sections: Array<Section>;
    content: T;
    buttons: Array<IconButton & LabelButton>;

    get_content_widget(): Gtk.Box;
}
