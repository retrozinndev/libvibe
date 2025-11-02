import Song from "./song";
import SongList from "./songlist";


export default class Queue extends SongList {
    constructor(songs?: Array<Song>, id?: any) {
        super({
            title: "Queue",
            id: id,
            songs: songs,
            description: "Your song queue"
        });
    }
}
