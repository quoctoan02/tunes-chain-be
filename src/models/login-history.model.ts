import {doQuery} from "../databases";

export const LoginHistoryModel = {
    list: async (data: any) => {
        let query = `select * from login_histories`;
        if (data.user_id) {
            query += ` where user_id = ${data.user_id}`;
        }
        return {
            data: await doQuery.listRows(query, data),
            total: await doQuery.countRows(query)
        }
    },
    create: async (data: any) => {
        return doQuery.insertRow('login_histories', data);
    },
};
