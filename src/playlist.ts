import GdkPixbuf from "gi://GdkPixbuf?version=2.0";
import Song from "./song";
import SongList from "./songlist";
import Plugin from "./plugin";
import Vibe from "./vibe";
import { gtype, property, register } from "gnim/gobject";


/** user-managed song list (handled by the app) */
@register({ GTypeName: "VibePlaylist" })
export default class Playlist extends SongList {

    @property(gtype<GdkPixbuf.Pixbuf|null>(GdkPixbuf.Pixbuf)) 
    image: GdkPixbuf.Pixbuf|null = null;

    constructor(properties: {
        title: string;
        description?: string;
        id?: any;
        plugin?: Plugin;
        image?: GdkPixbuf.Pixbuf;
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
