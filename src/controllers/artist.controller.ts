import {ErrorCode, OtpType, TokenType, Utils} from "../utils";
import {doQuery, Redis} from "../databases";
import {OTPController} from "./otp.controller";
import {ArtistModel} from "../models/artist.model";


export class ArtistController {
    public static async getByEmail(email: string) {
        return ArtistModel.getByEmail('email', email);
    };

    public static async get(artistId: number) {
        const artist: any = await ArtistModel.get(artistId);
        if (!artist)
            throw ErrorCode.ARTIST_NOT_FOUND;
        return artist;
    };

    public static async list() {
        return ArtistModel.listAll()
    };

    public static async update(data: any) {
        await ArtistModel.update(data);
        return this.get(data.artist_id);
    }

    public static async getByType(type: string, value: string) {
        return ArtistModel.getByTypeWithField(type, value, ['name', 'avatar']);
    };

    public static async change_password(artist_id: number, password: string, new_password: string) {
        // check email exist
        const artist_auth = await ArtistModel.getArtistAuth(artist_id);
        if (artist_auth) {
            // check password
            const isValidPw = await Utils.comparePassword(password, artist_auth.password_hash);
            if (!isValidPw) throw ErrorCode.PASSWORD_IS_INVALID;
            await ArtistModel.updatePassword(artist_id, new_password);
        } else {
            await doQuery.insertRow('artist_auths', {
                artist_id,
                password_hash: await Utils.hashPassword(new_password)
            });
        }
        // update artist
    };


    public static async get_verify_email_code(artist_id: number, email: string) {
        // check email exist
        const artist = await ArtistModel.get(artist_id);
        if (artist.email)
            throw ErrorCode.ARTIST_EMAIL_VERIFIED;

        const _artist = await ArtistModel.getByType('email', email);
        if (_artist && _artist.address)
            throw ErrorCode.EMAIL_EXISTS;
        // verify code
        await OTPController.sendOtp(OtpType.VERIFY_EMAIL, email.trim().toLowerCase());
    };

    public static async verify_email(artist_id: number, email: string, code: string) {
        // check email exist
        const artist = await ArtistModel.get(artist_id);
        if (artist.email)
            throw ErrorCode.ARTIST_EMAIL_VERIFIED;

        const _artist = await ArtistModel.getByType('email', email);
        if (_artist && _artist.address)
            throw ErrorCode.EMAIL_EXISTS;
        // verify code
        await OTPController.verify_otp(OtpType.VERIFY_EMAIL, email.trim().toLowerCase(), code);

        if (!_artist) {
            // update artist email
            await ArtistModel.update({artist_id, email});
        } else {
            await ArtistModel.mergeArtist(email, artist.address);
        }

        const timestamp = Date.now();
        const artistInfo = await ArtistModel.getByType('email', email);

        const auth_token = Utils.getArtistToken({artistId: artistInfo.id, timestamp, type: TokenType.LOGIN})
        await Redis.defaultCli.hset(`artist_auth_token`, `auth_time_${artistInfo.id}`, timestamp);
        await Redis.defaultCli.publish(`login_event`, JSON.stringify({artist_id: artistInfo.id, timestamp}));
        return {
            token: auth_token,
            artist_info: await ArtistModel.get(artistInfo.id),
            expiredAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        };
    };

}
