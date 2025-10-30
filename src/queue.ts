import Song from "./song";
import SongList from "./songlist";


export default class Queue extends SongList {
    constructor(songs?: Array<Song>) {
        super({
            title: "Queue",
            description: "Your song queue"
        });

        if(songs !== undefined)
            songs.forEach(s => this.add(s));
    }
}
