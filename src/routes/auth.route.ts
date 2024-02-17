import {Application, Request, Response, Router} from "express"
import {hpr, logger, routeResSuccess, Utils,} from "../utils"
import Joi from "joi"
import {LoginHistoryController} from "../controllers";
import geoip from 'geoip-lite'
import {UAParser} from 'ua-parser-js'
import {AuthController} from "../controllers/auth.controller";
import {Redis} from "../databases";
import {checkAuth} from "../middlewares";
import {UserModel} from "../models";


const login = async (req: Request, res: Response) => {
    const {sign, token, address, referral_code} = await Joi.object()
        .keys({
            address: Joi.string().required(),
            sign: Joi.string().required(),
            referral_code: Joi.string().allow('', null),
        })
        .and('username', 'password')
        .validateAsync(req.body)

    let ip: any = req.headers['x-forwarded-for'] || req.headers["x-real-ip"] || req.connection.remoteAddress || ""
    ip = ip.split(',')[0];
    if (ip.includes('::ffff:')) {
        ip = ip.split(':').reverse()[0]
    }
    const geo = geoip.lookup(ip as string)
    const ua = new UAParser(req.headers['user-agent'])


    const login_res = await AuthController.login(address, sign, referral_code)

    logger.trace("geo", geo);
    const userAgent = ua.getResult();
    const location = geo ? [geo.city, geo.region, geo.country] : []
    LoginHistoryController.create({
        ip: ip,
        user_id: login_res.user_info.id,
        browser: userAgent.browser.name ? `${userAgent.browser.name}/${userAgent.browser.version}` : null,
        os: userAgent.os.name ? `${userAgent.os.name}/${userAgent.os.version}` : null,
        device: userAgent.device.vendor ? `${userAgent.device.vendor}/${userAgent.device.model}` : null,
        location: location.filter(Boolean).join(', '),
    }).catch(e => logger.error('LoginHistory create', e));

    routeResSuccess(res, {
        ...login_res,
        geo,
        ipAddr: ip,
    })
}
const get_nonce = async (req: Request, res: Response) => {
    const {address}: { address: string } = await Joi.object()
        .keys({
            address: Joi.string().required(),
        })
        .validateAsync(req.query)


    let nonce: any = await Redis.defaultCli.hget('nonce', address.toLowerCase());
    if (!nonce) {
        nonce = Date.now();
        await Redis.defaultCli.hset('nonce', address.toLowerCase(), nonce);
    }
    routeResSuccess(res, {nonce})
}

const getVerifyEmailCode = async (req: Request, res: Response) => {
    const {email} = await Joi.object()
        .keys({
            email: Joi.string().email().required(),
        })
        .validateAsync(req.body);
    await AuthController.getVerifyCode(email);
    return routeResSuccess(res, {});
}

const verify_email = async (req: Request, res: Response) => {
    const {email, code} = await Joi.object()
        .keys({
            email: Joi.string().email().required(),
            code: Joi.string().required(),
        })
        .validateAsync(req.body);
    return routeResSuccess(res, await AuthController.verify_email(res.locals.userId, email, code));
}

const change_password = async (req: Request, res: Response) => {
    const {password, new_password}: { password: string, new_password: string } = await Joi.object()
        .keys({
            password: Joi.string().custom(Utils.passwordMethod).optional(),
            new_password: Joi.string().custom(Utils.passwordMethod).required(),
        })
        .validateAsync(req.body)

    await AuthController.change_password(res.locals.userId, password, new_password);

    routeResSuccess(res, {})
}

const getVerifyForgotPassword = async (req: Request, res: Response) => {
    const {email} = await Joi.object()
        .keys({
            email: Joi.string().email().required(),
        })
        .validateAsync(req.body);
    await AuthController.getVerifyForgotPassword(email);
    return routeResSuccess(res, {})
}

const finishForgotPassword = async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({
            email: Joi.string().email().required(),
            code: Joi.string().required(),
            password: Joi.string().custom(Utils.passwordMethod).required(),
        })
        .validateAsync(req.body);
    return routeResSuccess(res, await AuthController.finishForgotPassword(data));
}

const getUser = async (req: Request, res: Response) => {
    return routeResSuccess(res, await AuthController.getUser(res.locals.userId));
}

const fakeLogin = async (req: Request, res: Response) => {
    const {address , referral_code} = await Joi.object()
        .keys({
            address: Joi.string().required(),
            referral_code: Joi.string().allow('', null),
        })
        .validateAsync(req.body);
    return routeResSuccess(res, await AuthController.testLogin(address, referral_code));
}

export const AuthRoute = (app: Application) => {
    const authRouter = Router()
    app.use("/auth", authRouter)
    // Children
    authRouter.post("/login", hpr(login));
    authRouter.get("/get-nonce", hpr(get_nonce))
    authRouter.post("/get-verify-email-code", hpr(getVerifyEmailCode));
    authRouter.post("/verify-email", checkAuth, hpr(verify_email));
    authRouter.post("/get-verify-forgot-password", hpr(getVerifyForgotPassword));
    authRouter.post("/forgot-password", hpr(finishForgotPassword));
    authRouter.get("/info", hpr(getUser));
    authRouter.post("/fake-login", hpr(fakeLogin));
}
