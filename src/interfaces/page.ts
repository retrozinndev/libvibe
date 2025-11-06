import Gtk from "gi://Gtk?version=4.0";
import { IconButton, LabelButton, Section } from "..";
import { Album, Artist, Playlist, Song, SongList } from "../objects";


export enum PageModal {
    ARTIST = 0,
    SONG = 1,
    ALBUM = 2,
    PLAYLIST = 3
}

export type PageContentType<M extends PageModal> = M extends PageModal.SONG ?
    Song
: M extends PageModal.ARTIST ? 
    Artist
: M extends PageModal.ALBUM ?
    Album
: M extends PageModal.PLAYLIST ?
    Playlist
: SongList;

export type PageProps<
    M extends PageModal,
    T extends PageContentType<M>|unknown
> = {
    modal: M;
    title: string;
    sections?: Array<Section>;
    content: T,
    buttons?: Array<IconButton & LabelButton>;
};

export interface Page<
    M extends PageModal = PageModal.SONG,
    T extends PageContentType<M>|unknown = unknown,
> extends Gtk.StackPage {
    get modal(): M;
    title: string;
    sections: Array<Section>;
    content: T;

    buttons: Array<IconButton & LabelButton>;

    constructor(props: PageProps<M, T>): void;
}
