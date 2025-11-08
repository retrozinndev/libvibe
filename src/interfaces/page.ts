import Adw from "gi://Adw?version=1";
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
: undefined;

export type PageProps<
    M extends PageModal,
    T extends PageContentType<M>|unknown
> = {
    modal: M;
    title: string;
    id?: any;
    sections?: Array<Section>;
    content: T extends undefined ? undefined : T,
    buttons?: Array<IconButton & LabelButton>;
};

export interface Page<
    M extends PageModal = PageModal.SONG,
    T extends PageContentType<M>|undefined = undefined,
> extends Adw.Bin {
    readonly id: any;
    title: string;
    sections: Array<Section>;
    content?: T;
    buttons: Array<IconButton & LabelButton>;
    
    get modal(): M;
}
