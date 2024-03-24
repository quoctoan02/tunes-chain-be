import {SongModel} from "../models/song.model";
import {ErrorCode} from "../utils";

export class SongController {
    public static async create(data: any) {
        const song = await SongModel.getByType("name", data.name)
        if (song) throw ErrorCode.SONG_EXISTS

        return await SongModel.create(data)
    }

    public static async list(data: any) {

    }

    public static async removeCopyright() {

    }
}
