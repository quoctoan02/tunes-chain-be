import {config} from "../config"
import IORedis from "ioredis"
import {logger} from "../utils";

function newRedis(label = "default") {
    const newClient = new IORedis({
        ...config.redis,
        retryStrategy: (times) => {
            return Math.min(times * 50, 2000)
        },
    })
    newClient
        // .on("connect", () => logger.info(`Redis[${label}]: Connected`))
        // .on("ready", () => logger.info(`Redis[${label}]: Ready`))
        .on("error", (error) => logger.error(`Redis[${label}]: Error: `, error))
        .on("close", () => logger.info(`Redis[${label}]: Close connection`))
        .on("reconnecting", () => logger.info(`Redis[${label}]: Reconnecting`))
        .on("+node", (data) => logger.info(`Redis[${label}]: A new node is connected: `))
        .on("-node", (data) => logger.info(`Redis[${label}]: A node is disconnected: `))
        .on("node error", (data) => logger.error(`Redis[${label}]: An error occurs when connecting to a node: `))
        .on("end", () => logger.info(`Redis[${label}]: End`))
    return newClient
}

const defaultCli = newRedis()

const getObject = async (key: string) => {
    try {
        const dataFromRedis = await defaultCli.get(key)
        if (!!dataFromRedis) return JSON.parse(dataFromRedis)
    } catch (error) {
        console.log('Redis getObject: ', error)
    }
}

const lrangeObject = async (key: string) => {
    try {
        const dataFromRedis: any = await defaultCli.lrange(key, 0, -1)
        if (dataFromRedis) {
            return dataFromRedis.map((item: any) => JSON.parse(item))
        }
    } catch (error) {
        console.log('Redis lrangeObject: ', error)
    }
}

export const Redis = {
    newRedis,
    defaultCli,
    getObject,
    lrangeObject,
}
