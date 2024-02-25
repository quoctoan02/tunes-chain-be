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
    try {

        let chunks: any = [];
        let file_name: any = null;
        let mime_type: any = null;
        var busboy = new Busboy({ headers: req.headers })
        busboy.on('file', function (
            fieldname: any,
            file: any,
            filename: any,
            encoding: any,
            mimetype: any
        ) {
            console.log(
                'File [' +
                fieldname +
                ']: filename: ' +
                filename +
                ', encoding: ' +
                encoding +
                ', mimetype: ' +
                mimetype
            )
            file_name = filename
            mime_type = mimetype
            file.on('data', function (data: any) {
                console.log(
                    'File [' +
                    fieldname +
                    '] got ' +
                    data.length +
                    ' bytes'
                )
                chunks.push(data)
            })
            file.on('end', function () {
                console.log('File [' + fieldname + '] Finished')
            })
        })
        busboy.on('field', function (
            fieldname: any,
            val: any,
            fieldnameTruncated: any,
            valTruncated: any,
            encoding: any,
            mimetype: any,
        ) {
            console.log(
                'Field [' + fieldname + ']: value: ' + (val)
            )
        })
        busboy.on('finish', async function () {
            console.log('Done parsing form!')
            const params: UploadApiOptions = {
                folder: 'tunes-chain', // Thay 'your_folder_name' bằng tên thư mục bạn muốn lưu trữ trên Cloudinary
                public_id: uuidv4() + file_name, // Bạn cũng có thể sử dụng một public_id khác để đặt tên file trên Cloudinary
                resource_type: 'image',
                raw: true,
                format: mime_type.split('/')[1],
                overwrite: true,
            };

           const result = await cloudinary.uploader.upload_stream(params, function (err: any, data: any) {
                if (err) {
                    console.log(
                        'There was an error uploading your file: ',
                        err
                    )
                    throw ErrorCode.UNKNOWN_ERROR
                }
                console.log(
                    'Successfully uploaded file.',
                    data.secure_url
                )
                return routeResSuccess(res, data.secure_url );
            })
            chunks.forEach((chunk: any) => result.write(chunk));
            result.end();
        })
        req.pipe(busboy)
    } catch (e) {
        logger.error(e)
        throw ErrorCode.UNKNOWN_ERROR
    }
};

export const SongRoute = (app: Application) => {
    const routerName = Router()
    app.use("/song", routerName)
    // Children
    routerName.get("/list", hpr(getList));
    routerName.post("/upload", hpr(upload));
}

