import {doQuery} from "../databases";

export const BalanceHistoryModel = {
    list: async (data: any = {}) => {
        let query = `
            select bh.*,
            (SELECT symbol
                FROM currencies c
                WHERE  c.id = bh.currency_id)  AS symbol
            from balance_histories bh 
            where 1 = 1
        `;

        const fields: any[] = [];
        ['user_id', 'currency_id', 'type'].forEach(item => {
            if (data[item]) {
                query += ` and ${item} = ?`;
                fields.push(data[item]);
            }
        });
        if (data.from) {
            query += ` and from >= ?`;
            fields.push(data.from);
        }
        if (data.to) {
            query += ` and to < ?`;
            fields.push(data.to);
        }
        return {
            data: await doQuery.listRows(query, fields, data),
            total: await doQuery.countRows(query, fields)
        }

    },
    get: async (id: number) => {
        let query = `select c.* from balance_histories c where c.id = ${id}`;
        return doQuery.getOne(query, []);
    },

};
