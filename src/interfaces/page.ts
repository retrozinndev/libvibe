import Adw from "gi://Adw?version=1";
import Gtk from "gi://Gtk?version=4.0";
import { IconButton, LabelButton, Section } from "..";
import { Album, Artist, Playlist, Song } from "../objects";


export enum PageModal {
    CUSTOM = 0,
    SONG = 1,
    ALBUM = 2,
    PLAYLIST = 3,
    ARTIST = 4
}

export type PageContentType<M extends PageModal> = M extends PageModal.SONG ?
    Song
: M extends PageModal.ARTIST ? 
    Artist
: M extends PageModal.ALBUM ?
    Album
: M extends PageModal.PLAYLIST ?
    Playlist
: unknown;

type Props<M extends PageModal> = {
    modal: M;
    title: string;
    id?: any;
    sections?: Array<Section>;
    buttons?: Array<IconButton & LabelButton>;
};

export type PageProps<M extends PageModal> = M extends PageModal.CUSTOM ? 
    Props<M> & { content?: PageContentType<M> }
: Props<M> & { content: PageContentType<M> };

export interface Page<
    M extends PageModal = PageModal.CUSTOM
> extends Adw.Bin {
    readonly id: any;
    title: string;
    sections: Array<Section>;
    content?: PageContentType<M>;
    buttons: Array<IconButton & LabelButton>;
    
    get modal(): M;

    get_content_widget(): Gtk.Box;
}
