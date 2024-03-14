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
            track_id: Joi.number().required(),
            image: Joi.number().optional(),
            type: Joi.number().allow().required()
        })
        .validateAsync({...req.query, ...req.params, ...req.body});
    routeResSuccess(res, []);
};

export const PlaylistRoute = (app: Application) => {
    const routerName = Router()
    app.use("/playlist", routerName)
    // Children
    routerName.get("/list", hpr(getList));
}

