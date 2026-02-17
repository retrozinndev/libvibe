import Gio from "gi://Gio?version=2.0";
import GObject, { gtype, property, register, signal } from "gnim/gobject";
import Gst from "gi://Gst?version=1.0";
import { Artist, Album } from ".";
import { Meta } from "../utils";
import { Plugin } from "../plugin";
import { Vibe } from "..";
import { Image } from "../utils";
import GLib from "gi://GLib?version=2.0";


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
    @property(gtype<Image|null>(GObject.Object))
    image: Image|null = null;

    /** the number of the disc that the song makes part of. @default 1 */
    @property(Number)
    discNumber: number = 1;

    /** the song's ISRC(International Standard Recording Code). 
      * it's a unique identification code for the song. it's used in streaming services to find a song by it's "barcode".
      * can be null */
    @property(gtype<string|null>(String))
    isrc: string|null = null;

    /** the track number according to the song's album. @default 1 */
    @property(Number)
    trackNumber: number = 1;

    /** the song's publisher name. can be null */
    @property(gtype<string|null>(String))
    publisher: string|null = null;

    /** the song's launch date as a `GstDateTime` object. can be null */
    @property(gtype<Gst.DateTime|null>(Gst.DateTime))
    date: Gst.DateTime|null = null;

    /** the song's lyrics, in the LRC format. can be null */
    @property(gtype<string|null>(String))
    lyrics: string|null = null;


    constructor(properties: {
        title?: string;
        artist?: Array<Artist>;
        /** any data in the `Object` type that contains a way to stream/play this song. this is handled by 
          * the plugin's Media implementation(or the default Gstreamer one) */
        source?: T extends Gio.File|Gst.Stream ? T|string : T;
        id?: any;
        /** internally-used property to notify the api about a new song added for a plugin */
        plugin?: Plugin;
        explicit?: boolean;
        url?: string;
        image?: Image;
        album?: Album;
        discNumber?: number;
        isrc?: string;
        trackNumber?: number;
        publisher?: string;
        date?: Gst.DateTime;
        lyrics?: string;
    }) {
        super();

        this.id = properties.id ?? Vibe.getDefault().generateID();

        if(properties.source !== undefined)
            this.source = (typeof properties.source === "string" ?
                Gio.File.new_for_path(properties.source)
            : properties.source) as T;

        if(properties.explicit !== undefined)
            this.explicit = properties.explicit;
        
        if(properties.url !== undefined)
            this.url = properties.url;

        if(properties.title !== undefined)
            this.title = properties.title;

        if(properties.image !== undefined)
            this.image = properties.image;

        if(properties.artist !== undefined)
            this.artist = properties.artist;

        if(properties.discNumber !== undefined)
            this.discNumber = properties.discNumber;

        if(properties.isrc !== undefined)
            this.isrc = properties.isrc;

        if(properties.trackNumber !== undefined)
            this.trackNumber = properties.trackNumber;

        if(properties.publisher !== undefined)
            this.publisher = properties.publisher;

        if(properties.date !== undefined)
            this.date = properties.date;

        if(properties.lyrics !== undefined)
            this.lyrics = properties.lyrics;

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
