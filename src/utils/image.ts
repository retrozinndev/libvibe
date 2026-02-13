import Gdk from "gi://Gdk?version=4.0";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import Gly from "gi://Gly?version=2";
import GObject, { getter, gtype, register } from "gnim/gobject";
import { Song } from "../objects";
import { Vibe } from "..";
import GlyGtk4 from "gi://GlyGtk4?version=2";


/** image loading abstraction. use this with supported widgets.
  * this is mainly used in the Local plugin, to load album arts from metadata.
  *
  * if `uniqueData` is provided in construction, the class will 
  * cache the image into a file(if not already) and name it as the SHA1
  * of the provided `uniqueData`. this feature is used for session-persistent
  * image caching; which means that the image will be retrieved from cache
  * if `uniqueData` is the same between sessions.
  *
  * For usage in plugins:
  * just use it normally(no need to do anything different), provide 
  * the data needed for the image to be loaded by the class.
  *
  * For usage with custom widgets:
  * if the use outside of a supported widget is needed, please,
  * manually `ref()` and `unref()` the object, as it uses a 
  * different memory management system from the other objects */
@register({ GTypeName: "VibeImage" })
export class Image<T extends Image.SourceTypes> extends GObject.Object {
    declare $signals: Image.SignalSignatures;

    public static readonly cacheDir: Gio.File = Gio.File.new_for_path(
        `${Vibe.cacheDir.peek_path()!}/arts`
    );

    /** you should only change this value by using the defined 
      * setter for this field */
    #refs: number = 0;

    #source!: T;
    #cacheFile: Gio.File|null = null;
    #texture: Gdk.Texture|null = null;
    #cacheName: string|null = null;

    private set refs(newAmount: number) {
        this.#refs = newAmount;

        if(this.#refs < 1)
            this.unload().catch(console.error);
    }

    @getter(gtype<Gio.File|null>(Gio.File))
    get cacheFile() { return this.#cacheFile; }

    @getter(Boolean)
    get hasCacheFile() {
        return this.#cacheName !== null;
    }

    @getter(gtype<Gdk.Texture|null>(Gdk.Texture))
    get texture() { return this.#texture; }

    constructor(source: T|GLib.Bytes|string);
    constructor(source: T|GLib.Bytes|string, uniqueData: string|Song);

    /** @param source data for the image
      * @param uniqueData a unique-to-the-image type of data, like a song path. 
      * (you can also use a song instance for a non-session-persistent cache) */
    constructor(source?: T|GLib.Bytes|string, uniqueData?: string|Song) {
        super();

        if(uniqueData !== undefined && this.restoreFromCache(uniqueData)) 
            return;

        if(source === undefined)
            throw new Error("Image: Please provide a source to load the texture from");

        if(typeof source === "string") {
            this.#source = (/^[a-z]*:\/\/.*$/i.test(source) ?
                Gio.File.new_for_uri(source)
            : Gio.File.new_for_path(source)) as T;
            return;
        }

        if(source instanceof Gio.File) {
            this.#source = source as T;
            this.notify("has-cache-file");
            return;
        }

        this.#source = (source instanceof GLib.Bytes ?
            source.toArray()
        : source) as T;
        this.notify("has-cache-file");

        this.#cacheName = Image.generateCacheName(uniqueData);
        this.#cacheFile = Gio.File.new_for_path(`${Image.cacheDir.peek_path()!}/${this.#cacheName}`);
        this.notify("cache-file");
    }

    protected static generateCacheName(uniqueData?: string|Song): string {
        return uniqueData !== undefined ?
            uniqueData instanceof Song ?
                String(uniqueData.id)
            : GLib.compute_checksum_for_string(GLib.ChecksumType.SHA1, uniqueData, -1)!
        : Vibe.getDefault().generateID().toString();
    }

    protected restoreFromCache(uniqueData: string|Song): boolean {
        const cacheName = Image.generateCacheName(uniqueData);
        const cache = Gio.File.new_for_path(`${Image.cacheDir.peek_path()!}/${cacheName}`);

        if(cache.query_exists(null)) {
            this.#cacheFile = cache;
            this.#source = cache as T;
            return true;
        }

        return false;
    }

    /** asynchronously loads a `GdkTexture` from the `source` data into memory(if not already).
      * if the texture is already loaded, the call is ignored */
    async load(): Promise<void> {
        if(this.#texture)
            return;

        return new Promise((resolve, reject) => {
            const loader = this.#source instanceof Uint8Array ?
                Gly.Loader.new_for_bytes(this.#source)
            : Gly.Loader.new(this.#source);

            loader.load_async(null, (_, res) => {
                let image!: Gly.Image;
                try {
                    image = loader.load_finish(res);
                } catch(e) {
                    reject(e);
                    return;
                }

                image.next_frame_async(null, (_, res) => {
                    let texture!: Gdk.Texture;
                    try {
                        texture = GlyGtk4.frame_get_texture(image.next_frame_finish(res));
                    } catch(e) {
                        reject(e);
                        return;
                    }

                    this.#texture = texture;
                    this.notify("texture");
                    resolve();
                });
            });
        });
    }

    /** unload `GdkTexture` from memory. (keeps the `source` for later re-loading) */
    async unload(): Promise<void> {
        if(!this.#texture)
            return;

        this.#texture?.run_dispose();
        this.#texture = null;
        this.notify("texture");
    }

    ref(): Image<T> {
        this.refs++;
        return this;
    }

    unref(): void {
        this.refs > 0 && this.refs--;
    }
}

export namespace Image {
    export type SourceTypes = Gio.File|Uint8Array;
    export interface SignalSignatures extends GObject.Object.SignalSignatures {
        "unloaded": () => void;
        "loaded": () => void;
    }
}
