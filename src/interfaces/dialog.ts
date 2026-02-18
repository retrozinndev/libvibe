import Gtk from "gi://Gtk?version=4.0";


export interface Dialog {
    title: string|null;
    content?: Gtk.Widget|string|null;
    canClose?: boolean;
}
