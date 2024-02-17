import {ActiveStatus, BalanceHistoryType, ErrorCode, logger, MathUtils} from "../utils";
import {doQuery, sql} from "../databases";

export interface IUpdateBalance {
    user_id: number;
    currency_id: number;
    type: BalanceHistoryType;
    balance_change: string | number,
    reason_id: number | undefined | null,
}

export const BalanceModel = {
    list: async (user_id: number) => {
        let query = `select c.symbol,
                            c.id                     as currency_id,
                            c.type                   as currency_type,
                            COALESCE(b.balance, '0') as balance
                     from currencies c
                              left join balances b on b.currency_id = c.id and b.user_id = ${user_id}
                     where c.status = ${ActiveStatus.ACTIVATED}
        `;
        // logger.info("query", query);
        let [result, ignored]: any[] = await sql.query(query);
        return {
            data: result,
        }
    },
    get: async (user_id: number, currency_id: number) => {
        let query = `select c.symbol,
                            c.id                     as currency_id,
                            c.type                   as currency_type,
                            COALESCE(b.balance, '0') as balance
                     from currencies c
                              left join balances b on b.currency_id = c.id and b.user_id = ${user_id}
                     where c.status = ${ActiveStatus.ACTIVATED}
                       and b.user_id = ${user_id}
                       and b.currency_id = ${currency_id}`;
        // logger.info("query", query);
        return doQuery.getOne(query, []);
    },
    insert_balance_history: async (data: any, conn?: any) => {
        if (!conn)
            conn = sql;
        let query = `INSERT INTO balance_histories (user_id, currency_id, \`type\`, balance_before, balance_change, balance_after, reason_id)
        VALUES (
            ${data.user_id}, 
            ${data.currency_id}, 
            ${data.type},
            COALESCE((select balance from balances where user_id = ${data.user_id} and currency_id = ${data.currency_id}), 0), 
            ${data.balance_change},
            COALESCE((select balance from balances where user_id = ${data.user_id} and currency_id = ${data.currency_id}), 0) + ${data.balance_change},
            ${data.reason_id || 'NULL'}
            );`;
        logger.trace(query);
        let [result, ignored] = await conn.query(query);
        // @ts-ignore
        if (result.affectedRows == 0)
            throw ErrorCode.UNKNOWN_ERROR;
    },
    // update_balance: user_id, currency_id, balance_change, locked_balance_change
    update_balance: async (data: IUpdateBalance, conn?: any) => {
        if (!conn)
            conn = sql;
        if (data.balance_change && !MathUtils.isEqual(data.balance_change, '0')) {
            await BalanceModel.insert_balance_history(data, conn);
        }
        const query = `UPDATE balances 
                        SET balance = balance + ${data.balance_change || 0}
                        WHERE user_id = ${data.user_id} 
                          and currency_id = ${data.currency_id} 
                          and balance + ${data.balance_change || 0} >= 0;`;
        let [result1] = await conn.query(query);
        // @ts-ignore
        if (result1.affectedRows == 0)
            throw ErrorCode.UNKNOWN_ERROR;
        return true;
    },

    update_insert_balance: async (data: IUpdateBalance, conn: any) => {
        if (!conn)
            conn = sql;

        if (data.balance_change && !MathUtils.isEqual(data.balance_change, '0')) {
            await BalanceModel.insert_balance_history(data, conn);
        }

        const query = ` INSERT INTO balances (user_id, currency_id, balance)
            VALUES (${data.user_id}, ${data.currency_id}, ${data.balance_change || 0})
            ON DUPLICATE KEY UPDATE
                balance = balance + ${data.balance_change || 0};`;

        logger.info("query", query);
        let [result1] = await conn.query(query);
        // @ts-ignore
        if (result1.affectedRows == 0)
            throw ErrorCode.UNKNOWN_ERROR;
        return true;
    },

};
