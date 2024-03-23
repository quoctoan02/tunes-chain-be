import {Application, Router} from "express"
import {hpr, routeResSuccess, Utils} from "../utils"
import Joi from "joi"

const getList = async (req: any, res: any) => {
    const reqData = await Joi.object()
        .keys({
            ...Utils.baseFilter,
            type: Joi.string().default("All")
        })
        .validateAsync({...req.query, ...req.params, ...req.body});
    routeResSuccess(res, []);
};

export const FavoriteRoute = (app: Application) => {
    const routerName = Router()
    app.use("/favorite", routerName)
    // Children
    routerName.get("/list", hpr(getList));
}

