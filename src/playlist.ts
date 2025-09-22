import GdkPixbuf from "gi://GdkPixbuf?version=2.0";
import { ParamSpec, property, register } from "gnim/gobject";
import Song from "./song";
import SongList from "./songlist";


/** user-managed song list (handled by the app) */
@register({ GTypeName: "VibePlaylist" })
export default class Playlist extends SongList {
    readonly id: any;

    @property(GdkPixbuf.Pixbuf as unknown as ParamSpec<GdkPixbuf.Pixbuf|null>) 
    image: GdkPixbuf.Pixbuf|null = null;

    constructor(properties: {
        title: string;
        description?: string;
        songs?: Array<Song>;
    }) {
        super();

        this._title = properties.title;

        if(properties.description !== undefined)
            this._description = properties.description;

        if(properties.songs !== undefined)
            this._songs = properties.songs;
    }
}
