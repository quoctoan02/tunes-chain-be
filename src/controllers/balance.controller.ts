import {BalanceModel, CurrencyModel} from "../models";
import {ErrorCode} from "../utils";

export class BalanceController {
    public static async list(user_id: number) {
        return await BalanceModel.list(user_id);
    };

    public static async get(user_id: number, currency_id: number) {
        let currency = await CurrencyModel.get(currency_id);
        if (!currency)
            throw ErrorCode.CURRENCY_NOT_EXISTS;
        if (!currency.activate)
            throw ErrorCode.CURRENCY_NOT_ACTIVATED;

        return BalanceModel.get(user_id, currency_id);
    };
}
