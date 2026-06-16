import { getter, gtype, register } from "gnim/gobject"
import { Plugin } from "../plugin";
import { Vibe } from "..";
import GObject from "gi://GObject?version=2.0";


@register({ GTypeName: "VibeObject" })
export class VibeObject extends GObject.Object {
    declare readonly $signals: VibeObject.SignalSignatures;
    declare readonly $readableProperties: VibeObject.ReadableProperties;
    declare readonly $writableProperties: VibeObject.WritableProperties;
    declare readonly $constructOnlyProperties: VibeObject.ConstructOnlyProperties;
    declare readonly $readWriteProperties: VibeObject.ReadWriteProperties;

    /** the unique identifier of this object.
      * this is usually defined internally at construction-time. 
      * @readonly */
    readonly id: any;
    #plugin: Plugin|null = null;
    
    /** the plugin that manages this object. can be null if not provided 
      * by the plugin itself */
    @getter(gtype<Plugin|null>(GObject.Object))
    get plugin() { return this.#plugin; }

    constructor(props?: Partial<GObject.ConstructorProps<VibeObject>>) {
        super();

        this.id = props?.id ?? Vibe.getDefault().generateID();

        if(props?.plugin !== undefined) {
            Vibe.getDefault().emit("object-added", 
                (this.#plugin = props.plugin),
                this
            );
        }
    }
}

export namespace VibeObject {
    export interface ConstructOnlyProperties extends GObject.Object.ConstructOnlyProperties {
        "id": any;
        "plugin": Plugin;
    }
    export interface SignalSignatures extends GObject.Object.SignalSignatures {
        "notify::plugin"(): void;
    }

    export interface ReadableProperties extends GObject.Object.ReadableProperties {
        "plugin": Plugin|null;
    }
    export interface ReadWriteProperties extends GObject.Object.ReadWriteProperties {
    }
    export interface WritableProperties extends ReadWriteProperties {
    }
}
