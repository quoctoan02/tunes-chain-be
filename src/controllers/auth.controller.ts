import {UserModel} from "../models";
import {ErrorCode, logger, OtpType, TokenType, UserStatus, Utils} from "../utils";
import {doQuery, Redis, sql} from "../databases";
import {OTPController} from "./otp.controller";
import {recoverPersonalSignature} from "eth-sig-util";
import {config} from "../config";


export class AuthController {
    public static async login(address: string, sign: string, referral_code: string) {
        let nonce = await Redis.defaultCli.hget("nonce", address.toLowerCase());
        if (!nonce) throw ErrorCode.NONCE_INVALID;

        const msg = `0x${Buffer.from([config.blockchain.metamask_message, nonce].join(" "), "utf8").toString("hex")}`;

        const recoveredAddr = recoverPersonalSignature({
            data: msg,
            sig: sign,
        });
        if (recoveredAddr.toLowerCase() != address.toLowerCase()) throw ErrorCode.ADDRESS_INVALID;

        let userInfo = await UserModel.getByAddress(address);
        if (!userInfo) {
            const user_data: any = {
                address: address.toLowerCase(),
            };
            // let genRefCode = Utils.generateString(10);
            // let _user = await UserModel.getByType("referral_code", genRefCode);
            // while (_user) {
            //     genRefCode = Utils.generateString(10);
            //     _user = await UserModel.getByType("referral_code", genRefCode);
            // }
            const user_id = await UserModel.signup(user_data);
            userInfo = await UserModel.get(user_id);
        }
        if (userInfo.status != UserStatus.ACTIVATED) throw ErrorCode.USER_INVALID;

        const timestamp = Date.now();
        const auth_token = Utils.getUserToken({userId: userInfo.id, timestamp, type: TokenType.LOGIN});

        await Redis.defaultCli.hdel("nonce", address.toLowerCase());

        return {
            token: auth_token,
            user_info: await UserModel.getByIdWithAddress(userInfo.id),
            expiredAt: Date.now() + 12 * 60 * 60 * 1000,
        };
    }

    public static async loginEmail(email: string, password: string) {
        const userInfo = await UserModel.getByType("email", email);
        if (!userInfo) throw ErrorCode.USER_NOT_FOUND
        if (userInfo.status === UserStatus.DEACTIVATED)
            throw {
                error_code: ErrorCode.USER_NOT_ACTIVE_YET,
                data: {email: userInfo.email.slice(0, 2) + '***'}
            };
        if (userInfo.status === UserStatus.BANNED)
            throw ErrorCode.USER_BANNED;
        const user_auth = await UserModel.getUserAuth(userInfo.id);
        const isValidPw = await Utils.comparePassword(password, user_auth.password_hash)
        if (!isValidPw) throw ErrorCode.PASSWORD_IS_INVALID


        const timestamp = Date.now();
        const auth_token = Utils.getUserToken({userId: userInfo.id, timestamp, type: TokenType.LOGIN});
        // await Redis.defaultCli.publish(`login_event`, JSON.stringify({ userId: userInfo.id, timestamp }));


        return {
            token: auth_token,
            user_info: await UserModel.getByIdWithAddress(userInfo.id),
            //user_info: await UserController.get(userInfo.id),
            expiredAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        };
    };

    public static async getVerifyForgotPassword(email: string) {
        await this.getValidUserByEmail(email);
        await OTPController.sendOtp(OtpType.FORGOT_PASSWORD, email.trim().toLowerCase());
    }

    public static async finishForgotPassword(data: any) {
        const user = await this.getValidUserByEmail(data.email);
        await OTPController.verify_otp(OtpType.FORGOT_PASSWORD, data.email, data.code);
        return UserModel.updatePassword(user.id, data.password);
    }

    public static async getValidUserByEmail(email: string) {
        const user = await UserModel.getByType("email", email);
        if (!user) throw ErrorCode.USER_NOT_FOUND;
        return user;
    }

    public static async verify_email(user_id: number, email: string, code: string) {
        const user = await UserModel.get(user_id);
        if (user.email) throw ErrorCode.USER_EMAIL_VERIFIED;

        const _user = await UserModel.getByType("email", email);
        if (_user && _user.address) throw ErrorCode.EMAIL_EXIST;
        // verify code
        await OTPController.verify_otp(OtpType.VERIFY_EMAIL, email.trim().toLowerCase(), code);

        if (!_user) {
            // update user email
            await UserModel.update({user_id, email});
        } else {
            await UserModel.mergeUser(email, user.address);
        }

        const timestamp = Date.now();
        const userInfo = await UserModel.getByType("email", email);

        const auth_token = Utils.getUserToken({userId: userInfo.id, timestamp, type: TokenType.LOGIN});
        await Redis.defaultCli.hset(`user_auth_token`, `auth_time_${userInfo.id}`, timestamp);
        await Redis.defaultCli.publish(`login_event`, JSON.stringify({user_id: userInfo.id, timestamp}));
        return {
            token: auth_token,
            user_info: await UserModel.get(userInfo.id),
            expiredAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        };
    }

    public static async getVerifyCode(email: string) {
        const user = await UserModel.getByType("email", email);
        if (user && user.address) throw ErrorCode.EMAIL_ACTIVATED;
        await OTPController.sendOtp(OtpType.VERIFY_EMAIL, email.trim().toLowerCase());
    }

    public static async generateTokenAndInfo(user_id: number, address: string) {
        const timestamp = Date.now();
        await Redis.defaultCli.hdel("nonce", address.toLowerCase());
        return Utils.getUserToken({userId: user_id, timestamp, type: TokenType.LOGIN});
    }

    public static async change_password(user_id: number, password: string, new_password: string) {
        // check email exist
        const user_auth = await UserModel.getUserAuth(user_id);
        if (user_auth) {
            // check password
            if (!password) throw ErrorCode.PASSWORD_IS_INVALID;
            const isValidPw = await Utils.comparePassword(password, user_auth.password_hash);
            if (!isValidPw) throw ErrorCode.PASSWORD_IS_INVALID;
            await UserModel.updatePassword(user_id, new_password);
        } else {
            await doQuery.insertRow("user_auths", {
                user_id,
                password_hash: await Utils.hashPassword(new_password),
            });
        }
        // update user
    }

    public static async getUser(user_id: number) {
        return UserModel.get(user_id);
    }

    public static async gen_auth_token(id: any) {
        console.log(id);
        const user = await UserModel.get(id);
        const timestamp = Date.now();
        return Utils.getUserToken({userId: id, timestamp, type: TokenType.LOGIN});
    }

    public static async checkExistedAccount(data: any) {
        const user = await UserModel.getExistedPassword('email', data.email);
        if (user && user.password_hash) return {
            status: true
        }
        return {
            status: false
        }
    };

    public static async emailRegister(data: any) {
        const user = await UserModel.getExistedPassword('email', data.email);
        if (user && user.password_hash)
            throw ErrorCode.USER_EXISTS;

        // check code
        // await OTPController.verify_otp(OtpType.VERIFY_EMAIL, data.email, data.code, OtpWay.EMAIL);

        // if ('123456' != data.code)
        //     throw ErrorCode.OTP_INVALID_OR_EXPIRED;

        if (user && !user.password_hash) {
            let conn = await sql.getConnection();
            try {
                await conn.query("START TRANSACTION");
                logger.trace("start transaction");

                await UserModel.update({
                    user_id: user.id,
                    name: data.email.split('@')[0]
                }, conn);

                // create password
                await UserModel.insertUpdatePassword({
                    user_id: user.id,
                    password_hash: await Utils.hashPassword(data.password)
                }, conn);


                await conn.query("COMMIT");
                logger.trace("transaction COMMIT");
                conn.release();
                logger.trace("transaction release");
            } catch (e) {
                logger.error(e);
                await conn.query("ROLLBACK");
                conn.release();
                throw ErrorCode.UNKNOWN_ERROR;
            }

            return user.id;
        }
        const userInfo = {
            email: data.email,
            password: data.password,
            type: data.type,
            name: data.name
        }
        return await UserModel.signup(userInfo);
    };

    public static async testLogin(address: string, referral_code: string) {
        let userInfo = await UserModel.getByAddress(address);
        if (!userInfo) {
            const user_data: any = {
                address: address.toLowerCase(),
            };
            let genRefCode = Utils.generateString(10);
            let _user = await UserModel.getByType("referral_code", genRefCode);
            while (_user) {
                genRefCode = Utils.generateString(10);
                _user = await UserModel.getByType("referral_code", genRefCode);
            }
            const user_id = await UserModel.create({...user_data, referral_code, ref_code: genRefCode});
            userInfo = await UserModel.get(user_id);
        }
        if (userInfo.status != UserStatus.ACTIVATED) throw ErrorCode.USER_INVALID;

        const timestamp = Date.now();
        const auth_token = Utils.getUserToken({userId: userInfo.id, timestamp, type: TokenType.LOGIN});

        await Redis.defaultCli.hdel("nonce", address.toLowerCase());

        return {
            token: auth_token,
            user_info: userInfo,
            expiredAt: Date.now() + 12 * 60 * 60 * 1000,
        };
    }
}
