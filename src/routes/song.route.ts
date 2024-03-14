import {Application, Router, Request, Response} from "express"
import {ErrorCode, hpr, logger, routeResSuccess, Utils} from "../utils"
import Joi from "joi"
import {Cloudinary} from "../databases";
let Busboy = require('busboy')
import {UploadApiOptions, v2 as cloudinary} from 'cloudinary'
const { v4: uuidv4 } = require('uuid');
const getList = async (req: any, res: any) => {
    const reqData = await Joi.object()
        .keys({
            ...Utils.baseFilter,
            address: Joi.string().required(),
        })
        .validateAsync({...req.query, ...req.params, ...req.body});
    routeResSuccess(res, []);
};

const upload = async (req: Request, res: Response) => {

};

export const SongRoute = (app: Application) => {
    const routerName = Router()
    app.use("/song", routerName)
    // Children
    routerName.get("/list", hpr(getList));
    routerName.post("/upload", hpr(upload));
}

