import {Application, Router} from "express"
import {hpr, routeResSuccess, Utils} from "../utils"
import Joi from "joi"
import {AlbumController} from "../controllers/album.controller";

const getList = async (req: any, res: any) => {
    const reqData = await Joi.object()
        .keys({
            ...Utils.baseFilter,
        })
        .validateAsync({...req.query, ...req.params, ...req.body});
    routeResSuccess(res, await AlbumController.list());
};
const create = async (req: any, res: any) => {
    const reqData = await Joi.object()
        .keys({
            artist_id: Joi.number().required(),
            name: Joi.string().required(),
            release_date: Joi.date().required(),
        })
        .validateAsync({...req.query, ...req.params, ...req.body});
    routeResSuccess(res, []);
};
const get = async (req: any, res: any) => {
    const reqData = await Joi.object()
        .keys({
            id: Joi.number().required()
        })
        .validateAsync({...req.query, ...req.params, ...req.body});
    routeResSuccess(res, []);
};

export const AlbumRoute = (app: Application) => {
    const routerName = Router()
    app.use("/album", routerName)
    // Children
    routerName.get("/list", hpr(getList));
    routerName.get("/create", hpr(create));
    routerName.get("/get", hpr(get));
}

