import GObject, { ParamSpec, register } from "gnim/gobject";


@register({ GTypeName: "VibeArtist" })
export default class Artist extends GObject.Object {

    public static ArrayParamSpec = (name: string, flags: GObject.ParamFlags) =>
        GObject.ParamSpec.object(name, null, null, flags) as ParamSpec<Array<Artist>>;

    public static ParamSpec = (name: string, flags: GObject.ParamFlags) => 
        GObject.ParamSpec.jsobject(name, null, null, flags) as ParamSpec<Artist>;

    constructor() {
        super();
    }
}
