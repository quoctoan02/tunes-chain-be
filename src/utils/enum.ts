export enum ErrorCode {
    UNKNOWN_ERROR,
    TOKEN_IS_INVALID,
    UPDATE_ZERO_FIELD,
    TOO_MANY_REQUEST,
    OTP_INVALID_OR_EXPIRED,
    FILE_NOT_EXIST,
    DUPLICATE_REQUEST,

    // User
    USER_INVALID = 1000,
    USER_EXISTS,
    ADDRESS_EXISTS,
    USER_EMAIL_VERIFIED,
    EMAIL_EXISTS,
    PASSWORD_IS_INVALID,
    USER_NOT_FOUND,
    NONCE_INVALID,
    ADDRESS_INVALID,
    EMAIL_ACTIVATED,
    EMAIL_EXIST,
    USER_NOT_ACTIVE_YET,
    USER_BANNED,

    // collection
    COLLECTION_INVALID = 4001,

    // currency
    CURRENCY_INVALID = 6001,
    CURRENCY_NOT_EXISTS,
    CURRENCY_NOT_ACTIVATED,
    WITHDRAWAL_NOT_EXISTS,
    TOO_MANY_WITHDRAWAL_REQUEST,

    // balance
    NOT_ENOUGH_BALANCE,

    //song
    SONG_EXISTS

}

export enum HttpStatus {
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    PAYMENT_REQUIRE = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    REQUEST_TIMEOUT = 408,
    UNPROCESSABLE_ENTITY = 422,
    TOO_MANY_REQUEST = 429,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    SERVICE_UNAVAILABLE = 503,
}

export enum BalanceHistoryType {
    DEPOSIT = 1,
    WITHDRAWAL = 2,
}

export enum TokenEventType {
    CREATE = 1,
    TRANSFER,
    SET_PRICE,
    BID,
    CANCEL_BID,
    ACCEPT_BID,
    SOLD
}

export enum ActiveStatus {
    ACTIVATED = 1,
    UNACTIVATED = 2,
}

export enum TokenType {
    LOGIN = 1,
    ACTIVE_USER,
    RESET_PASSWORD,
}

export enum OtpType {
    VERIFY_EMAIL = 1,
    FORGOT_PASSWORD,
    VERIFY_WITHDRAWAL,
}

export enum OtpWay {
    EMAIL = 1,
    // MOBILE,
}

export enum UserStatus {
    ACTIVATED = 1,
    DEACTIVATED,
    BANNED,
}

export enum WithdrawalStatus {
    REQUESTED = 1,
    DONE = 2,
    FAILED,
}

export enum ConfigKey {

}

export enum UserType {
    USER = 1,
    ARTIST
}