import {config} from "../config"
import {ErrorCode, HttpStatus, routeHandleErr, TokenType} from "../utils"
import {NextFunction, Request, Response, Router} from "express"
import {UserModel} from "../models"
import bodyParser from "body-parser"
import compression from "compression"
import cors from "cors"
import helmet from "helmet/dist"
import jwt from "jsonwebtoken"

export const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
    let {authorization} = req.headers
    if (!authorization) {
        return routeHandleErr(res, ErrorCode.TOKEN_IS_INVALID, HttpStatus.UNAUTHORIZED)
    }
    authorization = authorization.replace('Bearer ', '');
    let jwtPayload: any
    try {
        jwtPayload = jwt.verify(authorization, config.jwtSecret)
        if (jwtPayload.type !== TokenType.LOGIN)
            throw ErrorCode.TOKEN_IS_INVALID
    } catch (e) {
        return routeHandleErr(res, ErrorCode.TOKEN_IS_INVALID, HttpStatus.UNAUTHORIZED)
    }
    const {userId, timestamp} = jwtPayload

    const newToken = jwt.sign({userId, timestamp}, config.jwtSecret, {expiresIn: "12h"})
    res.setHeader("token", newToken)
    res.locals.userId = userId
    next()
}

export const parseUserOptional = async (req: Request, res: Response, next: NextFunction) => {
    const {userId} = res.locals
    if (userId) {
        const user: any = await UserModel.get(userId)
        user.user_id = userId
        res.locals.userInfo = user
    }
    next()
}

export const notInProd = async (req: Request, res: Response, next: NextFunction) => {
    if (config.production) {
        res.status(HttpStatus.NOT_FOUND).json({
            status: HttpStatus.NOT_FOUND,
            message: 'Not found'
        })
    }else  {
        next()
    }
}


export const applyMiddleware = (router: Router) => {
    // --- cors
    router.use(cors({
        credentials: true,
        origin: true,
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["token"],
    }))
    // --- helmet
    router.use(helmet())
    // --- body parser
    router.use(bodyParser.urlencoded({extended: true}))
    router.use(bodyParser.json())
    // --- compression
    router.use(compression())
}
