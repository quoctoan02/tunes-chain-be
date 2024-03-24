import {Application, Request, Response, Router} from "express"
import {hpr, routeResSuccess, Utils} from "../utils"
import Joi from "joi"
import {SongController} from "../controllers/song.controller";

const getList = async (req: any, res: any) => {
    const reqData = await Joi.object()
        .keys({
            ...Utils.baseFilter,
        })
        .validateAsync({...req.query, ...req.params, ...req.body});
    routeResSuccess(res, []);
};

const create = async (req: Request, res: Response) => {
    const reqData = await Joi.object()
        .keys({
            name: Joi.string().required(),
            artists: Joi.array().required(),
            url: Joi.string().required(),
        })
        .validateAsync(req.body)


    routeResSuccess(res, await SongController.create(reqData))
};

export const SongRoute = (app: Application) => {
    const routerName = Router()
    app.use("/song", routerName)
    // Children
    routerName.get("/list", hpr(getList));
    routerName.post("/create", hpr(create));
}

