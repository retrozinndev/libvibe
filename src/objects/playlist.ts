import { register } from "gnim/gobject";
import { Vibe } from "..";
import { Song } from "./song";
import { SongList } from "./songlist";
import { Plugin } from "../plugin";
import { Image } from "../utils";


/** user-managed song list (handled by the app) */
@register({ GTypeName: "VibePlaylist" })
export class Playlist extends SongList {

    declare $signals: Playlist.SignalSignatures;

    constructor(properties: {
        title: string;
        description?: string;
        id?: any;
        plugin?: Plugin;
        image?: Image;
        songs?: Array<Song>;
    }) {
        super({
            title: properties.title,
            description: properties.description,
            image: properties.image,
            songs: properties.songs,
            id: properties.id
        });

        if(properties.plugin !== undefined)
            Vibe.getDefault().emit(
                "playlist-added",
                properties.plugin,
                this
            );
    }
}

export namespace Playlist {
    export interface SignalSignatures extends SongList.SignalSignatures {}
}
