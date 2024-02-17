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

export const RouteName = (app: Application) => {
    const routerName = Router()
    app.use("/history", routerName)
    // Children
    routerName.get("/list", hpr(getList));
}

