import https from "https";
import {logger} from "../utils";
import axios from "axios";
export const callSpotifyApi = async (
    endpoint: string,
    method: string,
    data ? : any
) => {
    try {
        const baseURL = `https://api.spotify.com/v1`
        let headers = {
            "Accept": "*/*",
            "Content-type": "application/json",
            Authorization : `Bearer ${process.env.SPOTIFY_ACCESS_TOKEN}`
        };
        let result: any;
        if (method.toUpperCase() === 'GET' || method.toUpperCase() === 'DELETE') {
            result = await axios({
                url: baseURL + endpoint,
                method,
                headers,
                params: data,
                timeout: 30000,
                httpsAgent: new https.Agent({keepAlive: true}),
            });
        }

        if (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT}') {
            result = await axios({
                url: baseURL + endpoint,
                method,
                headers,
                data,
                timeout: 30000,
                httpsAgent: new https.Agent({keepAlive: true}),
            });
        }
        console.log(result)
        return result?.data;
    } catch (error: any) {
        logger.error(error)
    }
}