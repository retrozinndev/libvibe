import Gtk from "gi://Gtk?version=4.0";
import { IconButton, LabelButton, Section } from "..";
import { Artist, Song, SongList } from "../objects";


export enum PageModal {
    ARTIST = 0,
    SONG = 1,
    ALBUM = 2,
    PLAYLIST = 3
}

export interface Page<
    M extends PageModal = PageModal.SONG,
    T extends (M extends PageModal.SONG ?
        Song
    : M extends PageModal.ARTIST ? 
        Artist
    : SongList)|unknown = unknown,
> extends Gtk.StackPage {
    get modal(): Page<M>;
    title: string;
    sections: Array<Section>;
    content: T;

    buttons: Array<IconButton & LabelButton>;

    constructor(props: {
        modal: M;
        title: string;
        sections?: Array<Section>;
        content: T,
        buttons?: Array<IconButton & LabelButton>;
    }): void;
}
