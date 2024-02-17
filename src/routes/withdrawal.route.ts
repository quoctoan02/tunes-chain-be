import {Application, Router} from "express"
import {ErrorCode, hpr, routeResSuccess, Utils} from "../utils"
import Joi from "joi"
import {WithdrawalController} from "../controllers";
import {checkAuth} from "../middlewares";

const getList = async (req: any, res: any) => {
    const reqData = await Joi.object()
        .keys({
            ...Utils.baseFilter,
            currency_id: Joi.number(),
            status: Joi.number(),
        })
        .validateAsync(req.query);
    routeResSuccess(res, await WithdrawalController.list({...reqData, user_id: res.locals.userId}));
};
const getById = async (req: any, res: any) => {
    const {id} = await Joi.object()
        .keys({
            id: Joi.number().required(),
        })
        .validateAsync(req.query);

    const withdrawal = await WithdrawalController.get(id);
    if (withdrawal.user_id != res.locals.userId)
        throw ErrorCode.WITHDRAWAL_NOT_EXISTS;

    return routeResSuccess(res, await WithdrawalController.get(id));
};
const lastWithdrawal = async (req: any, res: any) => {
    return routeResSuccess(res, {
        last_withdrawal: await WithdrawalController.lastWithdrawal(res.locals.userId)
    });
};

const requestWithdrawal = async (req: any, res: any) => {
    const { amount, symbol } = await Joi.object()
        .keys({
            quantity: Joi.string().required(),
            symbol: Joi.string(),
        })
        .validateAsync({...req.query, ...req.params, ...req.body});
    return routeResSuccess(res, await WithdrawalController.requestWithdrawal({
        amount,
        user_id: res.locals.userId,
        symbol
    }));
};

export const WithdrawalRoute = (app: Application) => {
    const authRouter = Router()
    app.use("/withdrawal", authRouter)
    authRouter.get("/list", checkAuth, hpr(getList));
    authRouter.get("/get", checkAuth, hpr(getById));
    authRouter.get("/last", checkAuth, hpr(lastWithdrawal));
    authRouter.post("/withdrawal", checkAuth, hpr(requestWithdrawal));
}

