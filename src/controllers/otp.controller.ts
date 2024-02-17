import {ErrorCode, logger, OtpType, OtpWay, SendEmail, Utils,} from "../utils";
import {Redis} from "../databases";

export class OTPController {
    public static async sendOtp(otpType: OtpType, id: string, otpWay: OtpWay = OtpWay.EMAIL, expTime?: number) {
        if (!expTime) expTime = 300;
        let _otpType: string = OtpType[otpType].toLowerCase();
        let _otpWay: string = OtpWay[otpWay].toLowerCase();
        const key = ['code', _otpType, _otpWay, id.trim().toLowerCase()].join('-');
        let obj_code: any = await Redis.defaultCli.get(key);
        if (obj_code) {
            obj_code = JSON.parse(obj_code);
            if (obj_code.time_create + 60000 > Date.now())
                throw ErrorCode.TOO_MANY_REQUEST;
        }

        let otp_code = Utils.generateCode();
        let obj = {
            code: otp_code,
            time_create: Date.now()
        }


        await Redis.defaultCli.set(key, JSON.stringify(obj), 'ex', expTime);
        logger.debug(key, otp_code);

        switch (otpType) {
            case OtpType.VERIFY_EMAIL: {
                if (otpWay == OtpWay.EMAIL) {
                    await SendEmail.verify_email({
                        email: id,
                        code: otp_code
                    })
                }
                break;
            }
            case OtpType.VERIFY_WITHDRAWAL: {
                if (otpWay == OtpWay.EMAIL) {
                    await SendEmail.verify_email({
                        email: id,
                        code: otp_code
                    })
                }
                break;
            }
            case OtpType.FORGOT_PASSWORD: {
                if (otpWay == OtpWay.EMAIL) {
                    await SendEmail.verify_email({
                        email: id,
                        code: otp_code
                    })
                }
                break;
            }
        }
    };


    public static async verify_otp(otpType: OtpType, id: string, code: string, otpWay: OtpWay = OtpWay.EMAIL) {
        let _otpType: string = OtpType[otpType].toLowerCase();
        let _otpWay: string = OtpWay[otpWay].toLowerCase();
        const key = ['code', _otpType, _otpWay, id.trim().toLowerCase()].join('-');

        let objCode: any = await Redis.defaultCli.get(key);
        if (!objCode)
            throw ErrorCode.OTP_INVALID_OR_EXPIRED;
        objCode = JSON.parse(objCode);

        if (objCode.time_create + 300000 < Date.now() || objCode.code != code)
            throw ErrorCode.OTP_INVALID_OR_EXPIRED;

        await Redis.defaultCli.del(key);
    };

}
