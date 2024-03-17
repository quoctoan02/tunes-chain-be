import {BalanceHistoryType, Currency, EventType, logger} from "../utils";
import {BalanceModel, BlockchainEventModel, CurrencyModel, UserModel} from "../models";
import {ethers} from 'ethers';

export class TokenCheckerController {
    public static async deposit(logArgs: any, log: any, contract: any, conn: any) {
        const depositFrom = logArgs.depositFrom;
        const value = ethers.utils.formatUnits(logArgs.value.toString());
        let user = await UserModel.getByType('address', depositFrom);
        if (!user) {
            logger.warn("user not exist, address: ", depositFrom);
            return;
        }
        const currency = await CurrencyModel.get_by_symbol(Currency.USDT);
        const event_id = await BlockchainEventModel.create({
            type: EventType.DEPOSIT,
            block_number: log.blockNumber,
            contract_id: contract.id,
            transaction_hash: log.transactionHash,
            data: JSON.stringify(logArgs)
        }, conn)
        await BalanceModel.update_insert_balance({
            user_id: user.id,
            currency_id: currency.id,
            type: BalanceHistoryType.DEPOSIT,
            balance_change: value,
            reason_id: event_id,
        }, conn);

        
    }
}