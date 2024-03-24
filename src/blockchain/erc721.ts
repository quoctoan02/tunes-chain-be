import {logger} from "../utils";

import {ethers} from 'ethers';
import erc721_abi from "../../assets/Erc721ABI.json"
import {ETH} from "./eth";


const get_contract = (blockchain: any, contract_address: string) => {
    return new ethers.Contract(
        contract_address,
        erc721_abi,
        ETH.get_provider(blockchain),
    )
}
const get_contract_signer = (blockchain: any, contract_address: string, private_key:string) => {
    // A Signer from a private key
    // let privateKey = config.blockchain.hot_wallet_private_key;
    let wallet = new ethers.Wallet(private_key, ETH.get_provider(blockchain));
    return get_contract(blockchain, contract_address).connect(wallet);
}

export const Erc721 = {
    totalSupply: async (blockchain: any, contract_address: string) => {
        return get_contract(blockchain, contract_address).totalSupply();
    },
    balanceOf: async (blockchain: any, contract_address: string, address: string) => {
        const balance = await get_contract(blockchain, contract_address).balanceOf(address);
        return balance;
    },
    allowance: async (blockchain: any, contract_address: string, owner: string, spender: string) => {
        return get_contract(blockchain, contract_address).allowance(owner, spender);
    },
    transfer: async (blockchain: any, contract_address: string, recipient: string, amount: string, private_key:string) => {
        let contractWithSigner = get_contract_signer(blockchain, contract_address, private_key);
        let tx = await contractWithSigner.transfer(recipient, amount);
        logger.info(tx.hash);
        return tx.hash;
    },
    approve: async (blockchain: any, contract_address: string, spender: string, private_key:string) => {
        let contractWithSigner = get_contract_signer(blockchain, contract_address,private_key);
        let tx = await contractWithSigner.approve(spender, '10000000000000000000000000000000000000000000000000');
        logger.info(tx.hash);
        return tx.wait();
    },
}
