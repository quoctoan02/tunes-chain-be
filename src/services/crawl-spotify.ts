import {config} from "../config";
import {ActiveStatus, logger, Utils} from "../utils";
import axios from "axios";
import {callSpotifyApi} from "./spotify";
import {doQuery} from "../databases";
import {ArtistModel} from "../models/artist.model";
import {AlbumModel} from "../models/album.model";
import {PlaylistModel} from "../models/playlist.model";
import {CategoryModel} from "../models/category.model";
import {SpotifyArtistModel} from "../models/spotify-artist.model";
import {SpotifyCategoryModel} from "../models/spotify-category.model";
import {SpotifyAlbumModel} from "../models/spotify_album.model";
import {ArtistSongModel} from "../models/artist-song.model";


const startServe = async () => {
    try {
        // const res = await callSpotifyApi("/me/following?type=artist", "GET", {limit: 50})
        const res = await SpotifyArtistModel.listAll()
        for (let artist of res) {
            console.log(artist)
            await ArtistModel.create({
                name: artist.data.name,
                avatar: artist.data.images[0].url,
                genres: JSON.stringify(artist.data.genres)
            })
        }

    } catch (e) {
        logger.error(e);
    } finally {
        // setTimeout(startServe, 3000)
    }
};

const album = async () => {
    try {
        // const artists = await ArtistModel.listAll()
        // for (let artist of artists) {
            //     const res = await callSpotifyApi(`/artists/${artist.id}/albums`, "GET", {limit: 10})
            const res = await SpotifyAlbumModel.listAll()
            for (let album of res) {
                console.log(album)
                     const artistInfo = await ArtistModel.getByType("name", album?.data.artists[0].name)
                const album_id = await AlbumModel.create({
                    name: album.data.name,
                    image: album.data.images[0].url,
                    total_songs: album.data.total_tracks,
                    release_date: album.data.release_date,
                    artist_name: album?.data.artists[0].name,
                    artist_id: (artistInfo && artistInfo?.id) || null
                })
                //    await AlbumModel.create({id: album.id, data: JSON.stringify(album)}).catch((e) => {})
                // for (let artist of album?.data.artists) {
                //     const artistInfo = await ArtistModel.getByType("name", artist.name)
                //     await AlbumArtistModel.create({album_id: album_id, artist_id: artistInfo.id})
                // }


            }
        //}

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
        // const res = await callSpotifyApi(`/browse/categories`, "GET", {limit: 50})
        const res = await SpotifyCategoryModel.listAll()

        for (let playlist of res) {
            // await CategoryModel.create({id: playlist.id, data: JSON.stringify(playlist)}).catch((e) => {
            await CategoryModel.create({name: playlist.data.name, icon_url: playlist.data.icons[0].url})
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
