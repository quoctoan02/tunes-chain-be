import {UserModel} from "../models";
import {ErrorCode, OtpType, TokenType, Utils} from "../utils";
import {doQuery, Redis} from "../databases";
import {OTPController} from "./otp.controller";


export class UserController {
    public static async getByEmail(email: string) {
        return UserModel.getByEmail('email', email);
    };

    public static async get(userId: number) {
        const user: any = await UserModel.get(userId);
        if (!user)
            throw ErrorCode.USER_NOT_FOUND;
        return user;
    };

    public static async update(data: any) {
        await UserModel.update(data);
        return this.get(data.user_id);
    }

    public static async getByType(type: string, value: string) {
        return UserModel.getByTypeWithField(type, value, ['name', 'avatar']);
    };

    public static async change_password(user_id: number, password: string, new_password: string) {
        // check email exist
        const user_auth = await UserModel.getUserAuth(user_id);
        if (user_auth) {
            // check password
            const isValidPw = await Utils.comparePassword(password, user_auth.password_hash);
            if (!isValidPw) throw ErrorCode.PASSWORD_IS_INVALID;
            await UserModel.updatePassword(user_id, new_password);
        } else {
            await doQuery.insertRow('user_auths', {
                user_id,
                password_hash: await Utils.hashPassword(new_password)
            });
        }
        // update user
    };


    public static async get_verify_email_code(user_id: number, email: string) {
        // check email exist
        const user = await UserModel.get(user_id);
        if (user.email)
            throw ErrorCode.USER_EMAIL_VERIFIED;

        const _user = await UserModel.getByType('email', email);
        if (_user && _user.address)
            throw ErrorCode.EMAIL_EXISTS;
        // verify code
        await OTPController.sendOtp(OtpType.VERIFY_EMAIL, email.trim().toLowerCase());
    };

    public static async verify_email(user_id: number, email: string, code: string) {
        // check email exist
        const user = await UserModel.get(user_id);
        if (user.email)
            throw ErrorCode.USER_EMAIL_VERIFIED;

        const _user = await UserModel.getByType('email', email);
        if (_user && _user.address)
            throw ErrorCode.EMAIL_EXISTS;
        // verify code
        await OTPController.verify_otp(OtpType.VERIFY_EMAIL, email.trim().toLowerCase(), code);

        if (!_user) {
            // update user email
            await UserModel.update({user_id, email});
        } else {
            await UserModel.mergeUser(email, user.address);
        }

        const timestamp = Date.now();
        const userInfo = await UserModel.getByType('email', email);

        const auth_token = Utils.getUserToken({userId: userInfo.id, timestamp, type: TokenType.LOGIN})
        await Redis.defaultCli.hset(`user_auth_token`, `auth_time_${userInfo.id}`, timestamp);
        await Redis.defaultCli.publish(`login_event`, JSON.stringify({user_id: userInfo.id, timestamp}));
        return {
            token: auth_token,
            user_info: await UserModel.get(userInfo.id),
            expiredAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        };
    };

}
