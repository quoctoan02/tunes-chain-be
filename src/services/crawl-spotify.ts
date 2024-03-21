import {config} from "../config";
import {ActiveStatus, logger, Utils} from "../utils";
import axios from "axios";
import {callSpotifyApi} from "./spotify";
import {doQuery} from "../databases";
import {ArtistModel} from "../models/artist.model";
import {AlbumModel} from "../models/album.model";
import {PlaylistModel} from "../models/playlist.model";
import {CategoryModel} from "../models/category.model";


const startServe = async () => {
    try {
        const res = await callSpotifyApi("/me/following?type=artist", "GET", {limit: 50})
        console.log(res)
        for (let artist of res?.artists?.items) {
            console.log(artist)
            await ArtistModel.create({id: artist.id, data: JSON.stringify(artist)})
        }

    } catch (e) {
        logger.error(e);
    } finally {
        setTimeout(startServe, 3000)
    }
};

const album = async () => {
    try {
        const artists = await ArtistModel.listAll()
        for (let artist of artists) {
            const res = await callSpotifyApi(`/artists/${artist.id}/albums`, "GET", {limit: 10})
            console.log(res)

            for (let album of res?.items) {
                console.log(album)
                await AlbumModel.create({id: album.id, data: JSON.stringify(album)}).catch((e) => {
                })
            }
        }

    } catch (e) {
        logger.error(e);
    } finally {
        //  setTimeout(startServe, 3000)
    }
};
let playlistOffset = 0
const playlist = async () => {
    try {
        const artists = await CategoryModel.listAll()
        for (let artist of artists) {
            console.log(artist.id)
            const res = await callSpotifyApi(`/browse/categories/${artist.id}/playlists`, "GET", {limit: 10})
            for (let playlist of res?.playlists?.items) {

                await PlaylistModel.create({id: playlist.id, data: JSON.stringify(playlist)}).catch((e) => {
                })
            }
        }
    } catch (e) {
        logger.error(e);
    } finally {
        playlistOffset += 50
       // setTimeout(playlist, 3000)

    }
};


const category = async () => {
    try {
        const res = await callSpotifyApi(`/browse/categories`, "GET", {limit: 50})

        for (let playlist of res?.categories?.items) {
            console.log(playlist)
            await CategoryModel.create({id: playlist.id, data: JSON.stringify(playlist)}).catch((e) => {
            })
        }

    } catch (e) {
        logger.error(e);
    } finally {
        playlistOffset += 50
       // setTimeout(playlist, 3000)

    }
};

export const CrawlService = {
    startServe, album, playlist, category
};
