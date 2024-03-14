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
            avatar: Joi.string().required(),
            background: Joi.string().required(),
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

export const ArtistRoute = (app: Application) => {
    const routerName = Router()
    app.use("/artist", routerName)
    // Children
    routerName.get("/list", hpr(getList));
    routerName.get("/create", hpr(create));
    routerName.get("/get", hpr(get));
}

