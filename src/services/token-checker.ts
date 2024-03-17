// import { ContractType, ErrorCode, logger, Utils } from "../utils";
// import { ethers } from "ethers";
// import { sql } from "../databases";
// import { ETH } from "../blockchain";
// import { BlockchainModel, ContractModel } from "../models";
// import { config } from "../config";
// import nft_abi from "../../assets/NFTABI.json";
// import mint_nft_abi from "../../assets/MintNft.json";
// import { cancelOrder, fillOrder, mintNft, placeOrder, transfer, buyCharacterEvent } from "./token-checker.service";
//
// const sync_blockchain = async (blockchain: any) => {
//     try {
//         logger.info("process start run!");
//         // get last block_number
//         let block_number = await ETH.block_number(blockchain);
//         logger.info(block_number);
//         // slow block
//         block_number -= 3;
//         let from_block = blockchain.block_number;
//         const step = 100;
//         const nft_collections_list: any[] = await ContractModel.list_contract({
//             blockchain_id: blockchain.id,
//             type: [ContractType.NFT_ITEM, ContractType.MARKET_PLACE_NFT, ContractType.MINT_NFT],
//         });
//
//         // get last sign block
//         while (block_number > from_block) {
//             await Utils.sleep(20);
//             const to_block = from_block + step > block_number ? block_number : from_block + step;
//             logger.info("from_block", from_block, "to_block", to_block);
//             let conn = await sql.getConnection();
//             try {
//                 await conn.query("START TRANSACTION");
//                 const list_logs: any[] = await ETH.get_logs(
//                     blockchain,
//                     from_block + 1,
//                     to_block,
//                     nft_collections_list.map((x) => x.address)
//                 );
//                 if (list_logs.length) {
//                     for (let log of list_logs) {
//                         const collection = nft_collections_list.find((x) => x.address.toLowerCase() == log.address.toLowerCase());
//                         if (!collection) throw ErrorCode.CONTRACT_NOT_EXISTED;
//                         let iface;
//                         const mapAbi: any = {
//                             [ContractType.NFT_ITEM]: nft_abi,
//                             [ContractType.MARKET_PLACE_NFT]: market_place_abi,
//                             [ContractType.MINT_NFT]: mint_nft_abi,
//                         };
//                         const abi = mapAbi[collection.type];
//                         if (!abi) throw ErrorCode.ABI_NOT_EXIST;
//                         iface = new ethers.utils.Interface(abi);
//                         let log_data;
//                         try {
//                             log_data = iface.parseLog(log);
//                         } catch (e) {
//                             logger.info("parse log exception", e);
//                             continue;
//                         }
//                         // logger.info(log_data);
//                         switch (log_data.name) {
//                             case "Transfer": {
//                                 await transfer(log_data, collection, log, blockchain, conn);
//                                 break;
//                             }
//                             case "PlaceOrder": {
//                                 await placeOrder(log_data, collection, log, nft_collections_list, conn);
//                                 break;
//                             }
//                             case "CancelOrder": {
//                                 await cancelOrder(log_data, collection, log, nft_collections_list, conn);
//                                 break;
//                             }
//                             case "FillOrder": {
//                                 await fillOrder(log_data, collection, log, nft_collections_list, conn);
//                                 break;
//                             }
//                             case "ItemMinted": {
//                                 await mintNft(log_data, collection, log, blockchain, conn);
//                                 break;
//                             }
//
//                             case "BuyCharacterEvent": {
//                                 await buyCharacterEvent(log_data, collection, log, blockchain, conn);
//                                 break;
//                             }
//                             default:
//                                 break;
//                         }
//                     }
//                 }
//                 await BlockchainModel.update_block_number(blockchain.id, to_block, from_block, conn);
//                 from_block = to_block;
//                 await conn.query("COMMIT");
//                 conn.release();
//             } catch (e) {
//                 logger.error("error", e);
//                 await conn.query("ROLLBACK");
//                 conn.release();
//                 break;
//             }
//         }
//     } catch (e) {
//         logger.error(e);
//     }
// };
//
// const run_process = async () => {
//     try {
//         const list_blockchains = await BlockchainModel.list();
//         for (let blockchain of list_blockchains) {
//             await sync_blockchain(blockchain);
//         }
//     } catch (e) {
//         logger.error(e);
//     } finally {
//         setTimeout(run_process, 5000);
//     }
// };
//
// export const TokenCheckerService = {
//     run_process,
// };
// if (config.direct_service) {
//     TokenCheckerService.run_process();
// }
