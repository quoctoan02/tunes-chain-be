import {doQuery, sql} from "../databases";
import {ActiveStatus} from "../utils";


export const CurrencyModel = {
    list: async (data: any = {}) => {
        let query = `select c.*
                     from currencies c
                     WHERE c.status = ${ActiveStatus.ACTIVATED}`;
        const fields: any[] = [];
        ['type', 'id'].forEach(item => {
            if (data[item]) {
                query += ` and ${item} = ?`;
                fields.push(data[item]);
            }
        });
        return {
            data: await doQuery.listRows(query, fields, data),
            total: await doQuery.countRows(query, fields)
        }
    },
    get: async (id: number) => {
        let query = `select c.*
                     from currencies c
                     WHERE c.id = ${id}`;
        // logger.info("query", query);
        let [result, ignored]: any[] = await sql.query(query);
        return result.length ? result[0] : null;
    },
    get_by_symbol: async (symbol: string) => {
        let query = `select c.*
                     from currencies c
                     WHERE c.symbol = '${symbol}'`;
        // logger.info("query", query);
        let [result, ignored]: any[] = await sql.query(query);
        return result.length ? result[0] : null;
    },
}
