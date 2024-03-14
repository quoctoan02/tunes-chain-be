import {Application, Router} from "express"
import {ErrorCode, hpr, logger, routeResSuccess, Utils} from "../utils"
import Joi from "joi"

let Busboy = require('busboy')
import {UploadApiOptions, v2 as cloudinary} from 'cloudinary'
import multer from "multer";
import {tryCatch} from "rxjs/internal-compatibility";

const {v4: uuidv4} = require('uuid');

const storage = multer.memoryStorage();
const upload = multer({storage: storage});
const uploadImage = async (req: any, res: any) => {
    try {

        let chunks: any = [];
        let file_name: any = null;
        let mime_type: any = null;
        var busboy = new Busboy({headers: req.headers})
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
                folder: 'tunes-chain/images', // Thay 'your_folder_name' bằng tên thư mục bạn muốn lưu trữ trên Cloudinary
                public_id: uuidv4() + file_name, // Bạn cũng có thể sử dụng một public_id khác để đặt tên file trên Cloudinary
                resource_type: 'image',
                raw: true,
                format: mime_type.split('/')[1],
                overwrite: true,
            };

            const result = cloudinary.uploader.upload_stream(params, function (err: any, data: any) {
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
                return routeResSuccess(res, data.secure_url)
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

const uploadToCloudinary = (req: any, res: any) => {
    let {
        fieldname, originalname, mimetype, encoding
    } = req.file

    console.log(fieldname, originalname, mimetype, encoding)
    const params: UploadApiOptions = {
        folder: `tunes-chain/${fieldname}s`, // Thay 'your_folder_name' bằng tên thư mục bạn muốn lưu trữ trên Cloudinary
        public_id: uuidv4() + originalname.replace(/\.[^/.]+$/, ''), // Bạn cũng có thể sử dụng một public_id khác để đặt tên file trên Cloudinary
        resource_type: 'auto',
    };
    const result = cloudinary.uploader.upload_stream(params, function (err: any, data: any) {
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
        let obj: any = {url: data.secure_url}
        if (['video', 'audio'].includes(fieldname)) {
            obj.duration = data.duration
        }
        routeResSuccess(res, obj)
    })
    result.end(req.file.buffer)
}


export const UploadRoute = (app: Application) => {
    const routerName = Router()
    app.use("/upload", routerName)
    // Children
    routerName.post("/image", upload.single('image'), hpr(uploadToCloudinary));
    routerName.post("/audio", upload.single('audio'), hpr(uploadToCloudinary));
    routerName.post("/video", upload.single('video'), hpr(uploadToCloudinary));
}

