import {BalanceModel, CurrencyModel, UserModel, WithdrawalModel} from "../models";
import {ErrorCode, MathUtils, UserStatus} from "../utils";
import {ETH} from "../blockchain";


export class WithdrawalController {

    public static async list(data: any) {
        return WithdrawalModel.list(data);
    };

    public static async get(id: number) {
        const withdrawal = await WithdrawalModel.get(id);
        if (!withdrawal) throw ErrorCode.WITHDRAWAL_NOT_EXISTS;
        return withdrawal;
    };

    public static async lastWithdrawal(user_id: number) {
        return WithdrawalModel.lastWithdrawal(user_id);
    };

    public static async requestWithdrawal(data: any) {
        // check currency
        const currency = await CurrencyModel.get_by_symbol(data.symbol);
        if (!currency) throw ErrorCode.CURRENCY_NOT_EXISTS;
        if (MathUtils.isLessThan(data.quantity, currency.min_withdrawal)) throw ErrorCode.ADDRESS_INVALID;

            // check user
        const user = await UserModel.get(data.user_id);
        if (!user || user.status != UserStatus.ACTIVATED || !user.address)
            throw ErrorCode.USER_NOT_FOUND;

        // check last withdrawal
        const lastWithdrawal = await WithdrawalModel.lastWithdrawal(data.user_id);
        // if (lastWithdrawal + 24 * 60 * 60 * 1000 > Date.now())
        //     throw ErrorCode.TOO_MANY_WITHDRAWAL_REQUEST;

        // check user balance
        const balanceObj = await BalanceModel.get(data.user_id, currency.id);
        if (!balanceObj || MathUtils.isLessThan(balanceObj.balance, data.quantity)) throw ErrorCode.NOT_ENOUGH_BALANCE;

        if (MathUtils.isLessThan(currency.max_withdrawal_amount, data.quantity) &&
            MathUtils.isLessThan(MathUtils.mul(currency.max_withdrawal_percent, balanceObj.balance), data.quantity))
            throw ErrorCode.NOT_ENOUGH_BALANCE;

        // create withdrawal
        const withdrawal_id = await WithdrawalModel.requestWithdrawal({
            ...data,
            to_address: user.address,
            currency_id: currency.id
        });
        const withdrawal = await WithdrawalModel.get(withdrawal_id);
        // create sign
        const exp_time = String(Math.round((Date.now() + 120000) / 1000));
        const value = MathUtils.mul(MathUtils.minus(withdrawal.amount, withdrawal.fee), Math.pow(10, currency.data.decimal));
        const sign_message: any[] = [
            {type: "address", value: user.address.toLowerCase()},
            {type: "uint256", value: String(withdrawal_id)},
            {type: "uint256", value: value},
            {type: "uint256", value: exp_time}
        ];
        return {
            withdrawal,
            sign_message,
            exp_time,
            value,
            sign: await ETH.get_hot_wallet_sign(sign_message),
        };
    };

}
