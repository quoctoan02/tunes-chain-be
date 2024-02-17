import {config} from "../config";

const colors = require('colors');
export const logger = require('tracer').colorConsole({
    filters: {
        //log : colors.black,
        trace: colors.magenta,
        debug: colors.cyan,
        info: colors.blue,
        warn: colors.yellow,
        error: [colors.red, colors.bold]
    },
    format: "{{timestamp}} <{{title}}> {{file}}:{{line}} ({{method}}) {{message}}",
    dateformat: "UTC:yyyy/mm/dd HH:MM:ss.l",
    level: config.logger.level
});
