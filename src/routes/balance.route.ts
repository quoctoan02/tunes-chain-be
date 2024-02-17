import {Application, Request, Response, Router} from "express";
import Joi from "joi";
import {hpr, routeResSuccess} from "../utils";
import {checkAuth} from "../middlewares";
import {BalanceController, BalanceHistoryController} from "../controllers";

const getHistory = async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({
            type: Joi.number(),
            from: Joi.string().regex(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/),
            to: Joi.string().regex(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/),
            limit: Joi.number().integer(),
            offset: Joi.number().integer(),
            order_by: Joi.string(),
            reverse: Joi.boolean(),
        })
        .validateAsync(req.query)
    data.user_id = res.locals.userId;
    routeResSuccess(res, await BalanceHistoryController.listHistory(data))
}

const getBalance = async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({})
        .validateAsync(req.query)

    return routeResSuccess(res, await BalanceController.list(res.locals.userId));
}

export const BalanceRoute = (app: Application) => {
    const router = Router();
    app.use("/balance", router);

    router.get("/get", checkAuth, hpr(getBalance))
    router.get("/history", checkAuth, hpr(getHistory))
}