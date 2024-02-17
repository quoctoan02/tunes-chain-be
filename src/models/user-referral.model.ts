import {doQuery, sql} from "../databases";
import {ErrorCode, logger} from "../utils";

const table = 'user_referral';

export const UserReferralModel = {
    getByType: async (type: string, value: any) => {
        return doQuery.getByType(table, type, value);
    },

    get: async (user_id: number) => {
        let query: string = `select * from ${table} where user_id = ?`
        let [result, ignored]: any[] = await sql.query(query, user_id);
        return result.length ? result[0] : null;
    },

    list: async (data: any) => {
        let query = `select address,
       u.id as id,
       u.updated_time,
       u.username,
       u.email,
       u.full_name,
       coalesce((select count(*) from user_referral ur2 where ur2.parent_id = ur.user_id), 0 ) as count_child
from user_referral ur
         left join users u on ur.user_id = u.id
where ur.parent_id = ?`;
        return {
            data: await doQuery.listRows(query, [data.parent_id], data),
            total: await doQuery.countRows(query, [data.parent_id]),
        }
    },

    getClusterBalance: async (user_id: number, depth: number, amount: number) => {
        const query = `select coalesce(sum(balance), 0) as cluster_balance, substr(path, position('.${user_id}.' in path), locate('.',path,  position('.${user_id}.' in path) + 3)) as cluster
                            from user_referral ur left join user_staking us on ur.user_id = us.user_id
                            where
                               ur.level - 2 <= ${depth} group by cluster having cluster_balance >= ${amount};`;
        const [result] = await sql.query(query);
        return result;
    },

    count_ref_user: async (user_id: number) => {
        const query = ` select coalesce(count(*), 0 ) as count_child from ${table} where parent_id = ?`;
        return doQuery.getOne(query, [user_id]);
    },

    update_path_and_parent: async (path: string, parent_id: number, user_id: number, conn = sql) => {
        const query = ` update ${table} set path = '${path}', parent_id = ${parent_id} where user_id = ${user_id}`;
        const [result] = await conn.query(query);
        if (!result.affectedRows) {
            logger.error('UPDATE PATH AND PARENT FAILED');
            throw ErrorCode.UNKNOWN_ERROR;
        }
        return true;
    },

    update: async (data: any, conn?: any) => {
        let query: string = `UPDATE ${table} SET parent_id = ${data.parent_id}, level = ${data.level}, path = '${data.path}' where user_id = ${data.user_id}`
        const [result] = await conn.query(query);
        if (!result.affectedRows) {
            logger.error('UPDATE PATH AND PARENT FAILED');
            throw ErrorCode.UNKNOWN_ERROR;
        }
        return true;
    }
}