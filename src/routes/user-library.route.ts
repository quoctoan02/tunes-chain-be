import {Application, Router} from "express"
import {hpr, routeResSuccess, Utils} from "../utils"
import Joi from "joi"
import {UserLibraryController} from "../controllers/user-library.controller";

const getList = async (req: any, res: any) => {
    const reqData = await Joi.object()
        .keys({
            ...Utils.baseFilter,
            type: Joi.string().default("All")
        })
        .validateAsync({...req.query, ...req.params, ...req.body});
    routeResSuccess(res, await UserLibraryController.list(reqData));
};

export const UserLibraryRoute = (app: Application) => {
    const routerName = Router()
    app.use("/user-library", routerName)
    // Children
    routerName.get("/list-favorite", hpr(getList));
}

