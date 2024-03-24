import {logger, Utils} from "../utils";
import {callSpotifyApi} from "./spotify";
import {ArtistModel} from "../models/artist.model";
import {AlbumModel} from "../models/album.model";
import {PlaylistModel} from "../models/playlist.model";
import {CategoryModel} from "../models/category.model";
import {SpotifyArtistModel} from "../models/spotify-artist.model";
import {SpotifyAlbumModel} from "../models/spotify_album.model";
import {SpotifySongModel} from "../models/spotify-song.model";
import {ArtistSongModel} from "../models/artist-song.model";
import {SongModel} from "../models/song.model";


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

let offset = 0
const song = async () => {
    let isStop = false
    try {
        // const res = await callSpotifyApi(`/browse/categories`, "GET", {limit: 50})
        //   const results = await SpotifyAlbumModel.listAll()
        let songs = await SpotifySongModel.listAll(offset)
        console.log(songs)
        while (songs?.length) {
            offset += 10

            await Promise.all(songs.map(async ({data: song}: any) => {
                console.log(song)
                const album = await AlbumModel.getByType("name", song.album.name || song.album.data.name)
                const song_id = await SongModel.create({
                    name: song.name,
                    duration: song.duration_ms / 1000,
                    album_id: album ? album?.id : null,
                    album_name: song.album.name || song.album.data.name,
                    url: song.preview_url
                })

                for (let artist of song.artists) {

                    const artistInfo = await ArtistModel.getByType("name", artist.name)
                    await ArtistSongModel.create({
                        song_id,
                        artist_id: artistInfo ? artistInfo.id : null,
                        price: Utils.getRandomInt(1, 100) / 100,
                        artist_name: artist.name
                    })
                }
            }))
            songs = await SpotifySongModel.listAll(offset)

        }
        //  const {items}  = await callSpotifyApi(`/albums/${res.id}/tracks`, "GET", {limit: 50})
        // await Promise.all(items.map((track: any) => {
        //     SpotifySongModel.create({id: track.id, data: JSON.stringify(track)})
        // }))
        // await CategoryModel.create({id: playlist.id, data: JSON.stringify(playlist)}).catch((e) => {
        // await CategoryModel.create({name: playlist.data.name, icon_url: playlist.data.icons[0].url})
    } catch (e) {
        logger.error(e);
    } finally {
   //      if (!isStop) setTimeout(song, 3000)

    }
};
const category = async () => {
        let isStop = false
        try {
            // const res = await callSpotifyApi(`/browse/categories`, "GET", {limit: 50})
            const results = await SpotifyAlbumModel.listAll()
            for (let res of results) {
                const {items} = await callSpotifyApi(`/albums/${res.id}/tracks`, "GET", {limit: 50})
                await Promise.all(items.map((track: any) => {
                    track.album = res
                    SpotifySongModel.create({id: track.id, data: JSON.stringify(track)})
                }))
                // await CategoryModel.create({id: playlist.id, data: JSON.stringify(playlist)}).catch((e) => {
                //     await CategoryModel.create({name: playlist.data.name, icon_url: playlist.data.icons[0].url})

            }
        } catch
            (e) {
            logger.error(e);
        } finally {
            //   if (!isStop) setTimeout(playlist, 3000)

        }
    }
;

export const CrawlService = {
    startServe, album, playlist, category, song
};
