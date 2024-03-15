import {Application, Router} from "express"
import {hpr, routeResSuccess, Utils} from "../utils"
import Joi from "joi"

const getList = async (req: any, res: any) => {
    const reqData = await Joi.object()
        .keys({
            ...Utils.baseFilter,
            address: Joi.string().required(),
        })
        .validateAsync({...req.query, ...req.params, ...req.body});
    routeResSuccess(res, []);
};

const create = async (req: any, res: any) => {
    const reqData = await Joi.object()
        .keys({
            name: Joi.string().required(),
            url: Joi.string().required(),
            duration: Joi.number().required(),
            album_id: Joi.number().integer().required()
        })
        .validateAsync({...req.query, ...req.params, ...req.body});
    routeResSuccess(res, []);
};

const get = async (req: any, res: any) => {
    const reqData = await Joi.object()
        .keys({
            id: Joi.number().integer().required()
        })
        .validateAsync({...req.query, ...req.params, ...req.body});
    routeResSuccess(res, []);
};

export const SongRoute = (app: Application) => {
    const routerName = Router()
    app.use("/track", routerName)
    // Children
    routerName.get("/list", hpr(getList));
    routerName.post("/create", hpr(create));
    routerName.get("/get", hpr(get));
}

