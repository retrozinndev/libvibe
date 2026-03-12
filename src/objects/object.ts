import GObject, { getter, gtype } from "gnim/gobject"
import { Plugin } from "../plugin";
import { Vibe } from "..";


export class VibeObject extends GObject.Object {
    #plugin: Plugin|null = null;
    /** the unique identifier of this object.
      * this is usually defined internally at construction-time. 
      * @readonly */
    readonly id: any;
    
    /** the plugin that manages this object. can be null if not provided 
      * by the plugin itself */
    @getter(gtype<Plugin|null>(GObject.Object))
    get plugin() { return this.#plugin; }

    constructor(props?: Partial<VibeObject.ConstructorProps>) {
        super();

        this.id = props?.id ?? Vibe.getDefault().generateID();

        if(props?.plugin !== undefined)
            this.#plugin = props.plugin;
    }
}

export namespace VibeObject {
    export interface ConstructorProps extends GObject.Object.ConstructorProps {
        plugin: Plugin;
        id: any;
    }
}
