import {LoginHistoryModel} from "../models";

export class LoginHistoryController {
    public static async list(data: any) {
        return await LoginHistoryModel.list(data);
    };

    public static async create(data: any) {
        return await LoginHistoryModel.create(data);
    };
}
