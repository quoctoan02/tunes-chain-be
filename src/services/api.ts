import express, {Application} from "express";
import {applyMiddleware} from "../middlewares"

import {config} from "../config"
import {logger} from "../utils";
import {BalanceRoute} from "../routes/balance.route";
import {AuthRoute, CommonRoute, CurrencyRoute, UserRoute, WithdrawalRoute,} from "../routes";
import {SongRoute} from "../routes/song.route";
import {UploadRoute} from "../routes/upload.route";

// --- Setup router
const setupRouter = (app: Application) => {
    AuthRoute(app)
    BalanceRoute(app)
    CommonRoute(app)
    CurrencyRoute(app)
    UserRoute(app)
    WithdrawalRoute(app)
    SongRoute(app)
    UploadRoute(app)
};

const startServe = async () => {
    const app: Application = express();
    applyMiddleware(app)
    setupRouter(app)

    const server = app.listen(config.serverPort);
    logger.info(`🚀 Server started as ${config.node_env} at http://localhost:${config.serverPort}`);

    // await WebSocketService.InitWebSocket({server})
};

export const ApiService = {
    startServe,
};