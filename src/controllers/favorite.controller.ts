import {AlbumModel} from "../models/album.model";
import {ArtistModel} from "../models/artist.model";

export class FavoriteController {
    public static async create(data: any) {

    }

    public static async list(data: any) {
        console.log(data.type)
        switch (data.type) {
            case "All" : {
                const [albums, artists] = await Promise.all([AlbumModel.listAll(), ArtistModel.listAll()])
                return [...albums, ...artists]
            }
            case 'Album' : {
                return await AlbumModel.listAll()
            }
            case 'Artist' : {
                return await ArtistModel.listAll()
            }
        }
    }

    public static async fname() {

    }
}
