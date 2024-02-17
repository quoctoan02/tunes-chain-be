import {Application, Router} from "express"
import {hpr, routeResSuccess} from "../utils"
import Joi from "joi"
import {CurrencyController} from "../controllers";


const getList = async (req: any, res: any) => {
    const reqData = await Joi.object()
        .keys({
            type: Joi.number(),
        })
        .validateAsync({...req.query, ...req.params, ...req.body});
    routeResSuccess(res, await CurrencyController.list(reqData));
};
const getById = async (req: any, res: any) => {
    const {currency_id} = await Joi.object()
        .keys({
            currency_id: Joi.number().required(),
        })
        .validateAsync(req.query);
    return routeResSuccess(res, await CurrencyController.get(currency_id));
};

const get_by_symbol = async (req: any, res: any) => {

    const {symbol} = await Joi.object()
        .keys({
            symbol: Joi.string().required(),
        })
        .validateAsync({...req.query, ...req.params, ...req.body});
    return routeResSuccess(res, await CurrencyController.get_by_symbol(symbol));
};

export const CurrencyRoute = (app: Application) => {
    const authRouter = Router()
    app.use("/currency", authRouter)
    // Children
    authRouter.get("/list", hpr(getList));
    authRouter.get("/get", hpr(getById));
    authRouter.get("/get-by-symbol", hpr(get_by_symbol));
}

