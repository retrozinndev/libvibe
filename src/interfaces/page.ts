import Gtk from "gi://Gtk?version=4.0";
import { IconButton, LabelButton, Section } from "..";
import { Album, Artist, Playlist, Song, SongList } from "../objects";


export enum PageModal {
    ARTIST = 0,
    SONG = 1,
    ALBUM = 2,
    PLAYLIST = 3
}

type ContentType<M extends PageModal> = M extends PageModal.SONG ?
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
    T extends ContentType<M>|unknown
> = {
    modal: M;
    title: string;
    sections?: Array<Section>;
    content: T,
    buttons?: Array<IconButton & LabelButton>;
};

export interface Page<
    M extends PageModal = PageModal.SONG,
    T extends ContentType<M>|unknown = unknown,
> extends Gtk.StackPage {
    get modal(): Page<M>;
    title: string;
    sections: Array<Section>;
    content: T;

    buttons: Array<IconButton & LabelButton>;

    constructor(props: PageProps<M, T>): void;
}
