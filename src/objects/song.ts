import Gio from "gi://Gio?version=2.0";
import GObject, { gtype, property, register, signal } from "gnim/gobject";
import GdkPixbuf from "gi://GdkPixbuf?version=2.0";
import Gst from "gi://Gst?version=1.0";
import { Artist, Album, Meta } from ".";
import { Plugin } from "../plugin";
import { Vibe } from "..";
import Gdk from "gi://Gdk?version=4.0";


/** store song data.
  * `T` - the source type. by default it's GstStream, GFile or a path to the audio file */
@register({ GTypeName: "VibeSong" })
export class Song<T extends Object = Gio.File|Gst.Stream> extends GObject.Object {

    declare $signals: Song.SignalSignatures;

    /** the unique identifier of this song, usually defined 
    * internally at construction.
    * @method Vibe.generateID() to generate an ID for this object */
    readonly id: any;

    @signal()
    prepare() {}

    /** the song title. can be null */
    @property(gtype<string|null>(String)) 
    title: string|null = null;

    /** the authors of this song, can be null */
    @property(gtype<Array<Artist>|null>(Array)) 
    artist: Array<Artist> = [];

    /** the album object where this song belongs, can be null */
    @property(gtype<Album|null>(GObject.Object))
    album: Album|null = null;

    /** the song url(sometimes the link to a streaming service), can be null */
    @property(gtype<string|null>(String))
    url: string|null = null;

    /** the song's source, can be a `GFile`(local), `GstStream`(tcp/udp streaming), null or any chosen type in construction */
    @property(gtype<T|null>(GObject.TYPE_JSOBJECT))
    source: T|null = null;

    /** if the song is explicit / has explicit content 
      * @default false */
    @property(Boolean)
    explicit: boolean = false;

    /** the song's individual image. usually, you don't need to define this,
    * as it's expected that only the album has an image; but you can also
    * use this if needed. can be null */
    @property(gtype<GdkPixbuf.Pixbuf|Gdk.Texture|null>(GObject.Object))
    image: GdkPixbuf.Pixbuf|Gdk.Texture|null = null;

    /** the song's internal metadata object. should be set by the plugin.
      * properties like title, album and others are automatically set if you change this */
    @property(gtype<Meta.Data|null>(Object))
    metadata: Meta.Data|null = null;

    constructor(properties: {
        title?: string;
        artist?: Array<Artist>;
        /** any data in the `Object` type that contains a way to stream/play this song */
        source?: T extends Gio.File|Gst.Stream ? T|string : T;
        id?: any;
        /** internally-used property to notify the api about a new song added for a plugin */
        plugin?: Plugin;
        explicit?: boolean;
        metadata?: Meta.Data;
        url?: string;
        image?: GdkPixbuf.Pixbuf|Gdk.Texture;
        album?: Album;
    }) {
        super();

        this.id = properties.id ?? Vibe.getDefault().generateID();

        if(properties.source !== undefined)
            this.source = (typeof properties.source === "string" ?
                Gio.File.new_for_path(properties.source)
            : properties.source) as T;

        if(properties.explicit !== undefined)
            this.explicit = properties.explicit;
        
        if(properties.metadata !== undefined)
            this.metadata = properties.metadata;

        if(properties.url !== undefined)
            this.url = properties.url;

        if(properties.title !== undefined)
            this.title = properties.title;

        if(properties.image !== undefined)
            this.image = properties.image;

        if(properties.artist !== undefined)
            this.artist = properties.artist;

        if(properties.plugin !== undefined)
            Vibe.getDefault().emit(
                "song-added",
                properties.plugin,
                this as unknown as Song
            );
    }
}

export namespace Song {
    export interface SignalSignatures extends GObject.Object.SignalSignatures {
        /** emitted when the previous song is about to finish, so the next one can be prepared for a faster load time */
        "prepare": () => void;
        "notify::source": () => void;
        "notify::name": () => void;
        "notify::artist": () => void;
        "notify::explicit": () => void;
        "notify::url": () => void;
        "notify::metadata": () => void;
        "notify::image": () => void;
        "notify::album": () => void;
    }
}
