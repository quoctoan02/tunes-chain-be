import { doQuery, sql } from "../databases";
import { ActiveStatus } from "../utils";

const TABLE = "contracts";

export const ContractModel = {
    list: async (data: any) => {
        let query: string = `select *
                             from ${TABLE} where status = ${ActiveStatus.ACTIVATED}`;
        if (data.type) query += ` and type = ${data.type}`;
        if (data.blockchain_id) query += ` and blockchain_id = ${data.blockchain_id}`;
        let [result, ignored]: any[] = await sql.query(query);
        return result;
    },
    list_contract: async (data: any) => {
        let query: string = `select *
                             from ${TABLE} where status = ${ActiveStatus.ACTIVATED} AND type IN (${data.type.join(", ")})`;

        if (data.blockchain_id) query += ` and blockchain_id = ${data.blockchain_id}`;
        let [result, ignored]: any[] = await sql.query(query);
        return result;
    },
    get: async (id: number) => {
        const query: string = `select *
                             from ${TABLE}
                             where id = ${id}`;
        return doQuery.getOne(query);
    },
    getByAddress: async (address: string) => {
        let query: string = `select *
                             from ${TABLE}
                             where LOWER(address) = '${address.toLowerCase()}'`;
        return doQuery.getOne(query);
    },

    getByType: async (type: string, value: any) => {
        const query: string = `select *
                               from ${TABLE}
                               where ${type} = lower(${value})`;
        return doQuery.getOne(query);
    },
};
