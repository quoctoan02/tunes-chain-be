import {doQuery, sql} from '../databases';
import {ActiveStatus} from '../utils';

export const BlockchainModel = {
    list: async () => {
        let query: string = `select *
                             from blockchains where status = ${ActiveStatus.ACTIVATED}`;
        let [result, ignored]: any[] = await sql.query(query);
        return result;
    },
    get: async (id: number) => {
        const query: string = `select *
                             from blockchains
                             where id = ?`;
        return doQuery.getOne(query, [id]);
    },
}