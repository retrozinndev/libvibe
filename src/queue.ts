import SongList from "./songlist";


export default class Queue extends SongList {
    constructor() {
        super({
            title: "Queue",
            description: "Your song queue"
        });
    }
}
