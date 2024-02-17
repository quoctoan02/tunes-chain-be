import {Application, Request, Response, Router} from "express"
import {ErrorCode, hpr, routeResSuccess, Utils} from "../utils"
import Joi from "joi";
import {UserController} from "../controllers";
import {checkAuth} from "../middlewares";

const get = async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({})
        .validateAsync(req.query)

    return routeResSuccess(res, await UserController.get(res.locals.userId));
}

const update = async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({
            avatar: Joi.string().allow(null, ''),
            mobile: Joi.string().allow(null, ''),
            // address: Joi.string(),
            name: Joi.string().allow(null, ''),
        })
        .validateAsync(req.body);
    data.user_id = res.locals.userId;
    return routeResSuccess(res, await UserController.update(data));
}

const get_verify_code = async (req: Request, res: Response) => {
    const {email}: { email: string } = await Joi.object()
        .keys({
            email: Joi.string().email().required(),
        })
        .validateAsync(req.body)

    await UserController.get_verify_email_code(res.locals.userId, email.trim().toLowerCase());

    routeResSuccess(res, {})
}

const verify = async (req: Request, res: Response) => {
    const {email, code}: { email: string, code: string } = await Joi.object()
        .keys({
            email: Joi.string().email().required(),
            code: Joi.string().required(),
        })
        .validateAsync(req.body);

    routeResSuccess(res, await UserController.verify_email(res.locals.userId, email.trim().toLowerCase(), code));
}

const change_password = async (req: Request, res: Response) => {
    const {password, new_password}: { password: string, new_password: string } = await Joi.object()
        .keys({
            password: Joi.string().custom(Utils.passwordMethod).optional(),
            new_password: Joi.string().custom(Utils.passwordMethod).required(),
        })
        .validateAsync(req.body)

    await UserController.change_password(res.locals.userId, password, new_password);

    routeResSuccess(res, {})
}

export const UserRoute = (app: Application) => {
    const router = Router();
    app.use("/user", router);

    router.get("/get", checkAuth, hpr(get));
    // router.put("/update", checkAuth, hpr(update));
    // router.post("/upload", hpr(upload));
    router.post("/get-verify-code", checkAuth, hpr(get_verify_code));
    router.post("/verify", checkAuth, hpr(verify));
    router.post("/change-password", checkAuth, hpr(change_password));
}
