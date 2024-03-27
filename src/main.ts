'use strict'

import {ApiService} from "./services";
import {logger} from "./utils";
import {CrawlService} from "./services/crawl-spotify";

const main = async () => {
    const runService = process.env.__SERVICE_NAME__;
    logger.info("Running service: ", runService);
    switch (runService) {
        default:
             await ApiService.startServe();
              // await CrawlService.album();
            break;
    }
}

main().catch(e => logger.error(e));
