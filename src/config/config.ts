import {config as dotenvConfig} from "dotenv";

dotenvConfig({
    path: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env",
});

export const config = {
    node_env: process.env.NODE_ENV,
    production: !process.env.NODE_ENV || process.env.NODE_ENV === "production",
    logger: {
        level: process.env.LOGGER_LEVEL ? Number(process.env.LOGGER_LEVEL) : 6, // 0: log, 1: trace, 2: debug, 3: info, 4: warn, 5: fatal, 6: error
    },
    mysql: {
        connectionLimit: process.env.MYSQL_CONNECTION_LIMIT
            ? Number(process.env.MYSQL_CONNECTION_LIMIT)
            : 10,
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DB,
        multipleStatements: false,
        timezone: "+00:00",
        debug: false,
    },
    redis: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        password: process.env.REDIS_PASSWORD,
        port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
        db: 0,
    },
    send_grid: {
        api_key: process.env.SENDGRID_API_KEY,
        email_from: process.env.EMAIL_FROM,
        template_id_verify_email: process.env.SENDGRID_TEMPLACE_VERIFY_EMAIL,
    },
    serverPort: process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 5000,
    jwtSecret: process.env.JWT_SECRET ? String(process.env.JWT_SECRET) : "",
    frontend_url: process.env.FE_URL,
    app_name: process.env.APP_NAME,
    blockchain: {
        metamask_message: process.env.NFT_METAMASK_MESSAGE || 'Address Sign',
        hot_wallet_address: process.env.HOT_WALLET_ADDRESS || '',
        hot_wallet_private_key: process.env.HOT_WALLET_KEY || '',
        gen_nft_private_key: process.env.GEN_NFT_KEY || '',
    },
    s3: {
        bucket: process.env.AMZ_S3_BUCKET,
        access_key: process.env.AMZ_S3_ACCESS_KEY,
        secret_key: process.env.AMZ_S3_SECRET_KEY,
        region: process.env.AMZ_S3_REGION,
    },
};
