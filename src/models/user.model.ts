import {doQuery, sql} from "../databases";
import {ErrorCode, logger, UserStatus, Utils} from "../utils";
import {ethers} from "ethers";
import crypto from "crypto";

export const UserModel = {
    get: async (userId: number) => {
        let query: string = `select u.*,
                                    uw.address
                             from users u
                             join user_wallets uw on uw.user_id = u.id
                             where u.id = ?`;
        let [result, ignored]: any[] = await sql.query(query, [userId]);
        return result.length ? result[0] : null;
    },
    getExistedPassword: async (type: string, value: string) => {
        let query: string = `select u.*, ua.password_hash
                             from users u
                             left join user_auths ua on ua.user_id = u.id
                            where LOWER(u.${type}) = ?`;
        let [result, ignored]: any[] = await sql.query(query, [
            value.trim().toLowerCase(),
        ]);
        return result.length ? result[0] : null;
    },
    getByType: async (type: string, value: string) => {
        let query: string = `select *,
                                    uw.address
                             from users
                             join user_wallets uw on uw.user_id = u.id
                             where LOWER(${type}) = ?`;
        let [result, ignored]: any[] = await sql.query(query, [value.trim().toLowerCase()]);
        return result.length ? result[0] : null;
    },
    getByEmail: async (type: string, value: string) => {
        let query: string = `select id, email, name
                             from users
                             where LOWER(${type}) = ?`;
        let [result, ignored]: any[] = await sql.query(query, [value.trim().toLowerCase()]);
        return result.length ? result[0] : null;
    },
    getWithAddress: async (userId: number) => {
        let query: string = `select u.*,
                                    uw.address
                            from users u
                            join user_wallets uw on uw.user_id = u.id
                            where u.id = ?`;
        let [result, ignored]: any[] = await sql.query(query, [userId]);
        return result.length ? result[0] : null;
    },
    getByAddress: async (address: string) => {
        let query: string = `select u.*,
                                    uw.address
                            from users u
                            join user_wallets uw on uw.user_id = u.id
                            where lower(uw.address)  = ?`;
        let [result, ignored]: any[] = await sql.query(query, [address]);
        return result.length ? result[0] : null;
    },
    create: async (data: any) => {
        const item: any = {
            status: UserStatus.ACTIVATED,
         //   referral_code: data.ref_code,
            address: data.address.trim().toLowerCase(),
        };
        // const parent = data.referral_code ? await UserModel.getByType("referral_code", data.referral_code) : null;
        // let level = 1;
        let conn = await sql.getConnection();
        try {
            await conn.query("START TRANSACTION");
            logger.trace("start transaction");
            let user_id = await doQuery.insertRow("users", item, conn);
            // let path = `${user_id}.`;
            // if (parent) {
            //     const parentReferral = await UserReferralModel.getByType("user_id", parent.id);
            //     level = parentReferral.level + 1;
            //     path = parentReferral.path + path;
            // } else {
            //     path = `.${user_id}.`;
            // }
            // await doQuery.insertRow(
            //     "user_referral",
            //     {
            //         user_id,
            //         parent_id: parent?.id || 0,
            //         level,
            //         path,
            //     },
            //     conn
            // );
            data.user_id = user_id;
            await conn.query("COMMIT");
            logger.trace("transaction COMMIT");
            conn.release();
            logger.trace("transaction release");
            return user_id;
        } catch (e) {
            logger.error(e);
            await conn.query("ROLLBACK");
            conn.release();
            throw ErrorCode.UNKNOWN_ERROR;
        }
    },
    updatePassword: async (user_id: number, password: string) => {
        const password_hash = await Utils.hashPassword(password);

        let query = ` Update user_auths
                      set password_hash = '${password_hash}'
                      where user_id = ${user_id} `;
        let [result, ignored]: any[] = await sql.query(query);
        if (result.affectedRows === 0) throw ErrorCode.UNKNOWN_ERROR;
    },

    update: async (data: any, conn?: any) => {
        const item: any = Utils.pickBy(data);
        return doQuery.updateRow("users", item, data.user_id, conn);
    },

    signup: async (data: any) => {

        const item: any = {
            status: UserStatus.ACTIVATED,
            type: data.type
        };
        if (data.email) item.email = data.email.trim().toLowerCase();
        if (data.mobile) item.mobile = data.mobile;
        if (data.name) item.name = data.name;

        let conn = await sql.getConnection();
        try {
            await conn.query("START TRANSACTION");
            logger.trace("start transaction");

            // create user
            let user_id = await doQuery.insertRow('users', item, conn);

            if(data.address) {
                //create wallet
                const _wallet = new ethers.Wallet('0x' + crypto.randomBytes(32).toString('hex'));

                // create wallet
                await doQuery.insertRow('user_wallets', {
                    user_id: user_id,
                    address: _wallet.address,
                    private_key: _wallet.privateKey
                }, conn);
            }

            if(data.password) {
                // create password
                await UserModel.insertUpdatePassword({
                    user_id,
                    password_hash: await Utils.hashPassword(data.password)
                }, conn);
            }

            data.user_id = user_id;
            // init item default
            await conn.query("COMMIT");
            logger.trace("transaction COMMIT");
            conn.release();
            logger.trace("transaction release");
            return user_id;
        } catch (e) {
            logger.error(e);
            await conn.query("ROLLBACK");
            conn.release();
            throw ErrorCode.UNKNOWN_ERROR;
        }
    },
    insertUpdatePassword: async (data: any, conn = sql) => {
        let query: string = `INSERT INTO user_auths (user_id, password_hash)
            VALUES (${data.user_id},'${data.password_hash}')
            ON DUPLICATE KEY UPDATE user_id = ${data.user_id}`;
        let [result, ignored]: any[] = await conn.query(query);
        return result.length ? result[0] : null;
    },
    getUserAuth: async (userId: number) => {
        let query: string = `select *
                             from user_auths
                             where user_id = ${userId}`;
        let [result, ignored]: any[] = await sql.query(query);
        return result.length ? result[0] : null;
    },

    getByTypeWithField: async (type: string, value: string, fields: string[]) => {
        const query = ` select ${fields.join(",")}
                        from users
                        where LOWER(${type}) = ?`;
        let [result, ignored]: any[] = await sql.query(query, [value]);
        return result.length ? result[0] : null;
    },

    mergeUser: async (email: string, address: string) => {
        let conn = await sql.getConnection();
        try {
            await conn.query("START TRANSACTION");
            logger.trace("start transaction");

            // update address of remove user
            const query = `update users
                           set address = '${email.trim().toLowerCase() + "-" + address}'
                           where LOWER(address) = '${address.trim().toLowerCase()}'`;
            let [result, ignored] = await conn.query(query);

            if (result.affectedRows !== 1) throw ErrorCode.UNKNOWN_ERROR;

            // update address of keep user
            const query2 = `update users
                            set address = '${address.trim().toLowerCase()}'
                            where LOWER(email) = '${email.trim().toLowerCase()}'`;
            let [result2, ignored2] = await conn.query(query2);

            if (result2.affectedRows !== 1) throw ErrorCode.UNKNOWN_ERROR;

            // init item default
            await conn.query("COMMIT");
            logger.trace("transaction COMMIT");
            conn.release();
            logger.trace("transaction release");
        } catch (e) {
            logger.error(e);
            await conn.query("ROLLBACK");
            conn.release();
            throw ErrorCode.UNKNOWN_ERROR;
        }
    },
};
