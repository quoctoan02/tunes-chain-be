import {config} from "../config";
import {ActiveStatus, logger, Utils} from "../utils";
import axios from "axios";
import {callSpotifyApi} from "./spotify";
import {doQuery} from "../databases";
import {ArtistModel} from "../models/artist.model";


const startServe = async () => {
    try {
        const res = await callSpotifyApi("/me/following?type=artist", "GET", {limit: 50})
        console.log(res)
        for(let artist of res?.artists?.items) {
            console.log(artist)
            await ArtistModel.create({id: artist.id,data: JSON.stringify(artist)})
        }

    } catch (e) {
        logger.error(e);
    } finally {
        setTimeout(startServe, 3000)
    }
};

// const artist = async () => {
//     try {
//         const artistApi = await callSpotifyApi("/artists")
//
//
//             } catch (e) {
//         logger.error(e);
//     } finally {
//         setTimeout(startServe, 3000)
//     }
// };

export const CrawlService = {
    startServe,
};
