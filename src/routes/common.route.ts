import {Application, Router} from "express";


export const CommonRoute = (app: Application) => {
    const router = Router();
    app.use("/common", router);
}