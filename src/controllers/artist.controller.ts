import {ArtistModel} from "../models/artist.model";

export class ArtistController {
    public static async create(data: any) {

    }

    public static async list() {
        return ArtistModel.listAll()
    }

    public static async fname() {

    }
}
