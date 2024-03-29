import {config} from "../config"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import PasswordValidator from 'password-validator'
import {ErrorCode, HttpStatus, TokenType} from "./enum";
import crypto from "crypto";
import Joi from "joi";
import { Redis } from "../databases";

const CAValidator = require('cryptocurrency-address-validator');

// --- Create password validator schema
const schema = new PasswordValidator();
schema.is().min(8).is().max(50).not().spaces();


const passwordMethod = (val: any, helpers: any) => {
    const valid = schema.validate(val)
    if (!valid) {
        return helpers.message(
            'Password must have 8-50 characters with no spaces'
        )
    }
    return val
}

const hashPassword = async (password: string) => {
    return bcrypt.hash(password, 10)
}

export interface iUserToken {
    userId: number,
    timestamp?: number,
    expiresIn?: string,
    type?: TokenType
}

const getUserToken = (data: iUserToken) => {
    return jwt.sign({
        userId: data.userId,
        timestamp: data.timestamp || Date.now(),
        type: data.type
    }, config.jwtSecret, {expiresIn: data.expiresIn || '7d'})
}

const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, config.jwtSecret)
    } catch (error: any) {
        console.log('err verifyToken :', error.message)
    }
}

const comparePassword = async (planePw: string, hashedPw: string) => {
    return bcrypt.compare(planePw, hashedPw)
}

const trimText = (str: string): string => {
    return str.trim().replace(/\s\s+/g, ' ')
}

const arrayToMap = (array: any[], key: string) => {
    const map = new Map()
    for (const item of array) {
        map.set(item[key], item)
    }
    return map
}
// --- Normalized number
const normalizeNumber = (num: number) => {
    return Number(num.toFixed(8));
};
const sha256 = (str: string) => {
    return crypto.createHash('sha256').update(str).digest('hex');
}

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const generateCode = (length: number = 6) => {
    const set = '0123456789';
    let salt = '';
    for (let i = 0; i < length; i++) {
        const p = Math.floor(Math.random() * set.length);
        salt += set[p];
    }
    return salt;
};

const generateString = (length: number = 6) => {
    const set = '0123456789abcdefghijklmnoporstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let salt = '';
    for (let i = 0; i < length; i++) {
        const p = Math.floor(Math.random() * set.length);
        salt += set[p];
    }
    return salt;
};

const isNumeric = (value: string) => {
    return /^-?\d+$/.test(value);
}

const validateCryptoAddress = (address: string, coinType: string, env: string = 'prod') => {
    // console.log("addr: ", address, " - ", coinType);
    coinType = coinType.toUpperCase();
    return CAValidator.validate(address, coinType, env);
};

const baseFilter = {
    status: Joi.number().integer(),
    limit: Joi.number().integer(),
    offset: Joi.number().integer(),
    order_by: Joi.string().default('updated_time'),
    reverse: Joi.boolean().default(true),
}

const pickBy = (object: any, predicate = (v: any) => v) => Object.entries(object).filter(([k, v]) => predicate(v)).reduce((acc, [k, v]) => ({
    ...acc,
    [k]: v
}), {});

const isEmpty = (object: any) => {
    return Object.keys(object).length === 0;
}

const sumBy = (arr: any[], key: string) => {
    return arr.reduce((acc: number, item: any) => acc + item[key], 0);
}

const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const preventSpam = async (collection: string, key: string, lock_time = 3000) => {
    let last_req: any = await Redis.defaultCli.hget(collection, key);
    if (!last_req) {
        last_req = Date.now();
        await Redis.defaultCli.hset(collection, key, last_req);
    } else {
        let req_space = Date.now() - last_req;
        if (req_space < lock_time) {
            throw ErrorCode.DUPLICATE_REQUEST;
        }
    }
    await Redis.defaultCli.hset(collection, key, Date.now());
}

const notInProd = (res: any) => {
    if (config.production) {
        res.status(HttpStatus.NOT_FOUND).json({
            status: HttpStatus.NOT_FOUND,
            message: 'Not found'
        })
    }
}


export const Utils = {
    hashPassword,
    comparePassword,
    passwordMethod,
    trimText,
    getUserToken,
    verifyToken,
    arrayToMap,
    normalizeNumber,
    sha256,
    getRandomInt,
    generateCode,
    generateString,
    isNumeric,
    validateCryptoAddress,
    baseFilter,
    isEmpty,
    sumBy,
    pickBy,
    preventSpam,
    notInProd,
    sleep
}
