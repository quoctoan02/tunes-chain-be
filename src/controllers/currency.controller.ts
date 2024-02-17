import {CurrencyModel} from "../models";
import {ErrorCode} from "../utils";


export class CurrencyController {

    public static async list(data: any) {
        return CurrencyModel.list(data);
    };

    public static async get(id: number) {
        const currency = await CurrencyModel.get(id);
        if (!currency) throw ErrorCode.CURRENCY_NOT_EXISTS;
        return currency;
    };

    public static async get_by_symbol(symbol: string) {
        const currency = await CurrencyModel.get_by_symbol(symbol);
        if (!currency) throw ErrorCode.CURRENCY_NOT_EXISTS;
        return currency;
    };

}
