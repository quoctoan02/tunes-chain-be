import {doQuery} from "../databases";
import {ConfigKey} from "../utils";

export const ConfigModel = {
    getByKey: async (key: ConfigKey) => {
        return doQuery.getByType('configs', 'key', key);
    }
};
