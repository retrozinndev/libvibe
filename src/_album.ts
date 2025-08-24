import GObject, { ParamSpec, register } from "gnim/gobject";

/** store album information */
@register({ GTypeName: "VibeAlbum" })
export default class Album extends GObject.Object {
    public static ParamSpec = (name: string, flags: GObject.ParamFlags) => 
        GObject.ParamSpec.jsobject(name, null, null, flags) as ParamSpec<Album>;

    constructor() {
        super();
    }
}
