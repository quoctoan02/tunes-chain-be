const mysql = require('mysql2/promise');
import {config} from "../config";
import {ErrorCode, logger} from '../utils';

console.log('sql pool init');
export const sql = mysql.createPool(config.mysql);

export const doQuery = {
    updateRow: async function (tableName: string, row: any, id: number, conn: any = null) {
        if (!Object.keys(row).length)
            throw ErrorCode.UPDATE_ZERO_FIELD;
        try {
            if (!conn)
                conn = sql;
            for (let i = 0; i < Object.keys(row).length; i++) {
                if (Array.isArray(Object.values(row)[i])) {
                    // @ts-ignore
                    row[Object.keys(row)[i]] = Object.values(row)[i].join(',');
                }
            }
            if (tableName === 'operator')
                row['status'] = 'updated';
            let query = 'UPDATE ' + tableName + ' SET ' + Object.entries(row).map(x => x[0] + ' = ?').join(', ') + " WHERE id = " + id;
            let [result, ignored] = await conn.query(query, Object.values(row));

            // @ts-ignore
            return result.affectedRows === 1;
        } catch (error) {
            throw error;
        }
    },
    insertRow: async function (tableName: string, row: any, conn: any = null) {
        if (!conn)
            conn = sql;
        for (let i = 0; i < Object.keys(row).length; i++) {
            if (Array.isArray(Object.values(row)[i])) {
                // @ts-ignore
                row[Object.keys(row)[i]] = Object.values(row)[i].join(',');
            }
        }
        let query = `INSERT INTO ${tableName}(${Object.keys(row).join(',')}) VALUES (${''.padStart((Object.values(row).length * 2) - 1, '?,')})`;
        logger.info(query);
        let [result, ignored] = await conn.query(query, Object.values(row));
        return result.insertId;
    },
    listRows: async function (query: string, fields: any[] = [], options: any = {}) {
        try {
            let limit: number = (options.limit ? options.limit : 50);
            let offset: number = (options.offset ? options.offset : 0);
            if (options.page)
                offset = (options.page - 1) * limit;
            let second_order = (options.second_order ? options.second_order : 'id');

            query = `select * from (${query}) as X`;

            query += ` order by ${options.order_by ? ('X.' + options.order_by + (options.reverse ? ' desc, ' : ',')) : ''} X.${second_order} limit ${limit} offset ${offset}`;

            logger.log("list query", query, fields);

            let [result, ignored] = await sql.query(query, fields);
            return result;
        } catch (error) {
            throw error;
        }
    },
    countRows: async function (query: string, fields: any[] = []) {
        try {
            query = `select count(*) as total from (${query}) as X`;

            let [result, ignored] = await sql.query(query, fields);
            return result ? result[0].total : 0;
        } catch (error) {
            throw error;
        }
    },
    doTransaction: async function (queries: string[]) {
        // get connection
        let conn = await sql.getConnection();
        let is_success;
        try {
            logger.trace('transaction start');
            logger.trace('queries', queries.length);
            await conn.query("START TRANSACTION");

            let query_string = queries.join('\n');
            // do query
            let [results, ignored] = await conn.query(query_string);

            if (!Array.isArray(results) && results.affectedRows == 0) {
                throw ErrorCode.UNKNOWN_ERROR;
            } else if (Array.isArray(results) && results.find((x: any) => x.affectedRows == 0)) {
                throw ErrorCode.UNKNOWN_ERROR;
            }
            logger.trace('transaction commit');
            await conn.query("COMMIT");
            logger.trace('transaction done');
            is_success = true;
        } catch (error) {
            logger.error(error);
            logger.trace('transaction rollback');
            await conn.query("ROLLBACK");
            is_success = false;
        } finally {
            conn.release();
        }
        return is_success;
    },

    getOne: async (query: string, params: any[]) => {
        const [result, ignored]: any[] = await sql.query(query, params);
        return result.length ? result[0] : null;
    },

    getByType: async (table: string, type: string, value: any) => {
        const query = `select * from ${table} t where lower(t.${type}) = lower(?) limit 1`;
        const [result] = await sql.query(query, [value]);
        return result.length ? result[0] : null;
    },

    getById: async (table: string, id: number | string) => {
        return doQuery.getByType(table, 'id', id);
    }
};
