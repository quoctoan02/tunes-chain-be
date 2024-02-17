'use strict'

import {ApiService} from "./services";
import {logger} from "./utils";

const main = async () => {
    const runService = process.env.__SERVICE_NAME__;
    logger.info("Running service: ", runService);
    switch (runService) {
        default:
            await ApiService.startServe();
            break;
    }
}

main().catch(e => logger.error(e));
