import Plugin from "./src/plugin";
import Album from "./src/_album";
import Song from "./src/_song";
import Artist from "./src/_artist";
import * as VibeNamespace from "./src/vibe";


const { isLabelButton, isIconButton, PlayerState } = VibeNamespace;
const Vibe = VibeNamespace.default;

export {
    Plugin,
    Album,
    Song,
    Artist,
    isIconButton,
    isLabelButton,
    PlayerState,
    Vibe
};
