import {doQuery, sql} from "../databases";
import {ArtistStatus, ErrorCode, logger, Utils} from "../utils";

const table = 'artists'
export const ArtistModel = {
    get: async (artistId: number) => {
        let query: string = `select a.*,
                                    aw.address
                             from artists a
                             left join artist_wallets aw on aw.artist_id = a.id
                             where a.id = ?`;
        let [result, ignored]: any[] = await sql.query(query, [artistId]);
        return result.length ? result[0] : null;
    },
    getExistedPassword: async (type: string, value: string) => {
        let query: string = `select a.*, aa.password_hash
                             from artists a
                             left join artist_auths aa on aa.artist_id = a.id
                            where LOWER(a.${type}) = ?`;
        let [result, ignored]: any[] = await sql.query(query, [
            value.trim().toLowerCase(),
        ]);
        return result.length ? result[0] : null;
    },
    getByTypeWithAddress: async (type: string, value: string) => {
        let query: string = `select *,
                                    aw.address
                             from artists a
                             left join artist_wallets aw on aw.artist_id = a.id
                             where LOWER(${type}) = ?`;
        let [result, ignored]: any[] = await sql.query(query, [value.trim().toLowerCase()]);
        return result.length ? result[0] : null;
    },
    getByType: async (type: string, value: string) => {
        return doQuery.getByType(table, type, value);
    },
    getByEmail: async (type: string, value: string) => {
        let query: string = `select id, email, name
                             from artists
                             where LOWER(${type}) = ?`;
        let [result, ignored]: any[] = await sql.query(query, [value.trim().toLowerCase()]);
        return result.length ? result[0] : null;
    },
    listAll: async () => {
        let query = `select * from ${table}`
        let [result] = await sql.query(query)
        return result;
    },
    getByIdWithAddress: async (artistId: number) => {
        let query: string = `select a.*,
                                    aw.address
                            from artists a
                            left join artist_wallets aw on aw.artist_id = a.id
                            where a.id = ?`;
        let [result, ignored]: any[] = await sql.query(query, [artistId]);
        return result.length ? result[0] : null;
    },
    getByAddress: async (address: string) => {
        let query: string = `select a.*,
                                    aw.address
                            from artists a
                            left join artist_wallets aw on aw.artist_id = a.id
                            where lower(aw.address)  = ?`;
        let [result, ignored]: any[] = await sql.query(query, [address]);
        return result.length ? result[0] : null;
    },
    create: async (data: any, conn?: any) => {
        return doQuery.insertRow(table, Utils.pickBy(data), conn);
    },
    updatePassword: async (artist_id: number, password: string) => {
        const password_hash = await Utils.hashPassword(password);

        let query = ` Update artist_auths
                      set password_hash = '${password_hash}'
                      where artist_id = ${artist_id} `;
        let [result, ignored]: any[] = await sql.query(query);
        if (result.affectedRows === 0) throw ErrorCode.UNKNOWN_ERROR;
    },

    update: async (data: any, conn?: any) => {
        return doQuery.updateRow("artists", Utils.pickBy(data), data.id, conn);
    },

    signup: async (data: any) => {

        const item: any = {
            status: ArtistStatus.ACTIVATED,
            type: data.type
        };
        if (data.email) item.email = data.email.trim().toLowerCase();
        if (data.name) item.name = data.name;

        let conn = await sql.getConnection();
        try {
            await conn.query("START TRANSACTION");
            logger.trace("start transaction");

            // create artist
            let artist_id = await doQuery.insertRow('artists', item, conn);



            data.artist_id = artist_id;
            // init item default
            await conn.query("COMMIT");
            logger.trace("transaction COMMIT");
            conn.release();
            logger.trace("transaction release");
            return artist_id;
        } catch (e) {
            logger.error(e);
            await conn.query("ROLLBACK");
            conn.release();
            throw ErrorCode.UNKNOWN_ERROR;
        }
    },
    insertUpdatePassword: async (data: any, conn = sql) => {
        let query: string = `INSERT INTO artist_auths (artist_id, password_hash)
            VALUES (${data.artist_id},'${data.password_hash}')
            ON DUPLICATE KEY UPDATE artist_id = ${data.artist_id}`;
        let [result, ignored]: any[] = await conn.query(query);
        return result.length ? result[0] : null;
    },
    getArtistAuth: async (artistId: number) => {
        let query: string = `select *
                             from artist_auths
                             where artist_id = ${artistId}`;
        let [result, ignored]: any[] = await sql.query(query);
        return result.length ? result[0] : null;
    },

    getByTypeWithField: async (type: string, value: string, fields: string[]) => {
        const query = ` select ${fields.join(",")}
                        from artists
                        where LOWER(${type}) = ?`;
        let [result, ignored]: any[] = await sql.query(query, [value]);
        return result.length ? result[0] : null;
    },

    mergeArtist: async (email: string, address: string) => {
        let conn = await sql.getConnection();
        try {
            await conn.query("START TRANSACTION");
            logger.trace("start transaction");

            // update address of remove artist
            const query = `update artists
                           set address = '${email.trim().toLowerCase() + "-" + address}'
                           where LOWER(address) = '${address.trim().toLowerCase()}'`;
            let [result, ignored] = await conn.query(query);

            if (result.affectedRows !== 1) throw ErrorCode.UNKNOWN_ERROR;

            // update address of keep artist
            const query2 = `update artists
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
