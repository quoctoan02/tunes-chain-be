import {BalanceHistoryModel} from "../models";


export class BalanceHistoryController {

    public static async list(data: any) {
        return BalanceHistoryModel.list(data);
    };

    public static async get(id: number) {
        return await BalanceHistoryModel.get(id);
    };

    public static async listHistory(data: any) {
        return await BalanceHistoryModel.list(data)
    }
}
