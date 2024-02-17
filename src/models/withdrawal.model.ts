import {doQuery, sql} from "../databases";
import {BalanceHistoryType, ErrorCode, logger, MathUtils, WithdrawalStatus} from "../utils";
import {BalanceModel} from "./balance.model";


export const WithdrawalModel = {
    list: async (data: any = {}) => {
        let query = `select * from withdrawals where 1=1 `;
        const fields: any[] = [];
        ['status', 'user_id', 'currency_id'].forEach(item => {
            if (data[item]) {
                query += ` and ${item} = ? `;
                fields.push(data[item]);
            }
        });
        return {
            data: await doQuery.listRows(query, fields, data),
            total: await doQuery.countRows(query, fields)
        }
    },
    get: async (id: number) => {
        const query = `select w.*
                     from withdrawals w
                     WHERE w.id = ?`;
        // logger.info("query", query);
        return doQuery.getOne(query, [id]);
    },
    lastWithdrawal: async (user_id: number) => {
        let query = `select unix_timestamp(created_time) * 1000 as last_withdrawal
                     from withdrawals w
                     WHERE w.user_id = ${user_id} and status != ${WithdrawalStatus.FAILED} order by id desc limit 1`;
        // logger.info("query", query);
        let [result, ignored]: any[] = await sql.query(query);
        return result.length ? Number(result[0].last_withdrawal) : 0;
    },
    requestWithdrawal: async (data: any) => {
        let conn = await sql.getConnection();
        try {
            await conn.query("START TRANSACTION");

            let withdrawal: any = {
                user_id: data.user_id,
                to_address: data.to_address,
                currency_id: data.currency_id,
                quantity: data.quantity,
                status: WithdrawalStatus.REQUESTED,
            };
            if (data.fee) {
                withdrawal.fee = data.fee;
            }

            let withdrawal_id = await doQuery.insertRow('withdrawals', withdrawal, conn);

            await BalanceModel.update_balance({
                user_id: data.user_id,
                currency_id: data.currency_id,
                type: BalanceHistoryType.WITHDRAWAL,
                balance_change: MathUtils.minus('0', data.quantity),
                reason_id: withdrawal_id,
            }, conn);

            await conn.query("COMMIT");
            conn.release();
            return withdrawal_id;
        } catch (e) {
            console.error(e)
            await conn.query("ROLLBACK");
            conn.release();
            logger.log('Update deposit confirm failedSSS!', e);
            throw ErrorCode.UNKNOWN_ERROR;
        }
    },
}
