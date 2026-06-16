import { register, setter } from "gnim/gobject";
import { Vibe } from "..";
import { SongList } from "./songlist";
import GObject from "gi://GObject?version=2.0";


/** user-managed song list (handled by the app) */
@register({ GTypeName: "VibePlaylist" })
export class Playlist extends SongList {
    declare $signals: Playlist.SignalSignatures;

    @setter(String)
    set title(str: string) {
        this._title = str;
        this.notify("title");
    }

    constructor(properties: Partial<GObject.ConstructorProps<Playlist>>) {
        super({
            title: properties.title,
            description: properties.description,
            image: properties.image,
            songs: properties.songs,
            id: properties.id
        });

        if(properties.plugin)
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
