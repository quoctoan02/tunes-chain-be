import {AlbumModel} from "../models/album.model";


export class AlbumController {
    public static async create(data: any) {

    }

    public static async list() {
        return AlbumModel.listAll()
    }

    public static async fname() {

    }
}
