import {ErrorCode, logger, MathUtils, Utils} from "../utils";
import {doQuery, sql} from "../databases";

export enum TransactionType {
    FAUCET = 1,
    POINT_MINT,
    POINT_REDEEM,
}

export enum TransactionStatus {
    PENDING = 1,
    PROCESSING,
    DONE,
    FAILED,
}

export const UserWalletModel = {
    get: async (userId: number) => {
        let query = `select *
                     from user_wallets
                     where user_id = ?`;
        let [result, ignored]: any[] = await sql.query(query, [userId]);
        return result.length ? result[0] : null;
    },
    create: async (data: any) => {
        let item: any = {
            user_id: data.user_id,
            address: data.address,
        };
        if (data.private_key) {
            item.private_key = data.private_key;
        }
        return doQuery.insertRow('user_wallets', item);
    },
    getAddressesByEmail: async (emails: []) => {
        let query: string = `select uw.address, u.email
                            from users u
                            join user_wallets uw on uw.user_id = u.id
                            where u.email in (?)`;
        let [result, ignored]: any[] = await sql.query(query, [emails]);
        return result.length ? result : null;
    },
};
