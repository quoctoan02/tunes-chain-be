import {ethers} from 'ethers';
import {config} from "../config";

const EthCrypto = require("eth-crypto");
const providers: any = {};

const get_provider = (blockchain: any) => {
    if (!providers[blockchain.symbol]) {
        providers[blockchain.symbol] = new ethers.providers.JsonRpcProvider(
            blockchain.rpc_url, {name: blockchain.name, chainId: blockchain.chain_id});
    }
    return providers[blockchain.symbol];
}
export const ETH = {
    get_provider: (blockchain: any) => {
        return get_provider(blockchain);
    },
    block_number: async (blockchain: any) => {
        return get_provider(blockchain).getBlockNumber();
    },
    get_logs: async (blockchain: any, from: number, to: number, address: string, topic?: string) => {
        const req: any = {
            address: address,
            fromBlock: from,
            toBlock: to,
        };
        if (topic)
            req.topic = topic;
        // console.log(req)
        return get_provider(blockchain).getLogs(req);
    },
    get_hot_wallet_sign: async (sign_message: any[]) => {
        const dataHash = EthCrypto.hash.keccak256(sign_message);
        let dataHashBin = ethers.utils.arrayify(dataHash)
        let wallet = new ethers.Wallet(config.blockchain.hot_wallet_private_key);
        const signature = await wallet.signMessage(dataHashBin);
        // const signature = EthCrypto.sign(config.blockchain.hot_wallet_private_key, dataHash);
        const r = signature.slice(0, 66);
        const s = "0x" + signature.slice(66, 130);
        const v = parseInt(signature.slice(130, 132), 16);
        return {sign: signature, dataHash, r, s, v};
    },

    get_gen_nft_sign: async (sign_message: any[]) => {
        const dataHash = EthCrypto.hash.keccak256(sign_message);
        let dataHashBin = ethers.utils.arrayify(dataHash)
        let wallet = new ethers.Wallet(config.blockchain.gen_nft_private_key);
        const signature = await wallet.signMessage(dataHashBin);
        // const signature = EthCrypto.sign(config.blockchain.hot_wallet_private_key, dataHash);
        const r = signature.slice(0, 66);
        const s = "0x" + signature.slice(66, 130);
        const v = parseInt(signature.slice(130, 132), 16);
        return {sign: signature, dataHash, r, s, v};
    },
}
