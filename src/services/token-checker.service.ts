// import {
//     BlockchainEventType,
//     ConfigType,
//     ContractType,
//     ErrorCode,
//     logger,
//     NftOpenStatus,
//     NftSaleStatus,
//     NftType,
//     rootAddress,
//     Utils
// } from "../utils";
// import {
//     BlockchainEventModel,
//     CharacterModel,
//     ContractModel,
//     NftBoardModel,
//     NftModel,
//     UserCharacterModel,
//     UserModel
// } from "../models";
// import {ethers} from "ethers";
// import {NftMetadataModel} from "../models/nft-metadata";
// import {ConfigModel} from "../models/config.model";
//
// const Web3Utils = require("web3-utils");
//
// const mapContractType: any = {
//     [ContractType.MARKET_PLACE_NFT]: ContractType.NFT_ITEM,
// };
//
// export const transfer = async (log_data: any, collection: any, log: any, blockchain: any, conn: any) => {
//     const token_id = Web3Utils.hexToNumberString(log_data.args.tokenId);
//
//     logger.trace("token_id", token_id);
//     const to_address = log_data.args.to.toLowerCase();
//     const from_address = log_data.args.from.toLowerCase();
//     console.log({to_address});
//     console.log({from_address});
//     const is_mint = from_address === rootAddress;
//     const is_burn = to_address === rootAddress;
//     logger.trace("event:", is_mint ? " mint " : is_burn ? " burn " : " transfer ", "token_id", token_id);
//     const nft_event: any = {
//         transaction_hash: log.transactionHash,
//         token_id,
//         contract_id: collection.id,
//         block_number: log.blockNumber,
//         metadata: JSON.stringify({to_address, from_address}),
//         type: is_mint ? BlockchainEventType.TRANSFER : is_burn ? BlockchainEventType.BURNED : BlockchainEventType.TRANSFER,
//         // type: is_mint ? BlockchainEventType.CREATE : is_burn ? BlockchainEventType.BURNED : BlockchainEventType.TRANSFER,
//     };
//     let nft: any = {
//         token_id,
//         contract_id: collection.id,
//     };
//
//     if (is_mint) {
//         // nft.owner = to_address;
//         // // check collection = Nft
//         // const is_mint_nft = collection.type == ContractType.NFT;
//         // if (is_mint_nft) {
//         //     await NftModel.mintNftAsync(nft, conn);
//         // }
//         // if (!is_mint_nft) {
//         //     await NftModel.create(nft, conn);
//         // }
//     } else if (is_burn) {
//         await NftModel.burn(nft, conn);
//     } else {
//         await NftModel.transfer(collection.id, token_id, to_address, conn);
//     }
//     await BlockchainEventModel.create(nft_event, conn);
// };
//
// export const placeOrder = async (log_data: any, collection: any, log: any, nft_collections_list: any[], conn: any) => {
//     const {
//         token_id,
//         collection_nft,
//         nft
//     } = await getTokenIdCollectionAndNft(log_data, nft_collections_list, collection.type);
//     const seller = log_data.args.seller;
//     const price = ethers.utils.formatUnits(log_data.args.price);
//     logger.trace(" place order token_id = ", token_id);
//     const data = JSON.stringify({
//         collection_market: collection.id,
//         seller,
//         price,
//         address: collection.address,
//     });
//     const nft_event: any = generateEvent(log, data, BlockchainEventType.SET_PRICE, token_id, collection_nft.id);
//
//     await NftModel.update({
//         price: price,
//         id: nft.id,
//         sale_owner: seller.toLowerCase(),
//         sale_status: NftSaleStatus.SELLING
//     }, conn);
//     await BlockchainEventModel.create(nft_event, conn);
// };
//
// export const cancelOrder = async (log_data: any, collection: any, log: any, nft_collections_list: any[], conn: any) => {
//     const {
//         token_id,
//         collection_nft,
//         nft
//     } = await getTokenIdCollectionAndNft(log_data, nft_collections_list, collection.type);
//     const seller = log_data.args.seller;
//     logger.trace("cancel order token_id = ", token_id);
//     const data = JSON.stringify({
//         collection_market: collection.id,
//         seller,
//         address: collection.address,
//     });
//     const nft_event: any = generateEvent(log, data, BlockchainEventType.CANCEL_ORDER, token_id, collection_nft.id);
//     await NftModel.update({price: null, id: nft.id, sale_owner: null, sale_status: NftSaleStatus.NOT_SALE}, conn);
//     await BlockchainEventModel.create(nft_event, conn);
// };
//
// export const fillOrder = async (log_data: any, collection: any, log: any, nft_collections_list: any[], conn: any) => {
//     const {
//         token_id,
//         collection_nft,
//         nft
//     } = await getTokenIdCollectionAndNft(log_data, nft_collections_list, collection.type);
//     const {seller, buyer} = log_data.args;
//     const price = ethers.utils.formatUnits(log_data.args.price);
//     logger.trace("fill order token_id = ", token_id);
//     const data = JSON.stringify({
//         collection_market: collection.id,
//         seller,
//         buyer,
//         price,
//         address: collection.address,
//     });
//     const nft_event: any = generateEvent(log, data, BlockchainEventType.SOLD, token_id, collection_nft.id);
//     await NftModel.update({price: null, id: nft.id, sale_owner: null, sale_status: NftSaleStatus.NOT_SALE}, conn);
//     await BlockchainEventModel.create(nft_event, conn);
// };
//
// export const mintNft = async (log_data: any, collection: any, log: any, blockchain: any, conn: any) => {
//     const nft_collection = await ContractModel.getByType("type", collection.type);
//     const token_id = Number(Web3Utils.hexToNumberString(log_data.args.tokenId));
//     const to_address = log_data.args.toAddress.toLowerCase();
//     const data_event = JSON.stringify({
//         token_id,
//         to_address,
//     });
//
//     const nft_event = generateEvent(log, data_event, BlockchainEventType.CREATE, token_id, nft_collection.id);
//     logger.trace("token_id minted = ", token_id);
//
//     // const nft_metadata = await generate_metadata(collection, conn);
//     // const { id, name, type, ...metadata } = nft_metadata;
//
//     const nft_metadata = await NftMetadataModel.get_by_contract_and_type(collection.id, NftType.CHEST);
//     const {id, name, type, ...metadata} = nft_metadata;
//     const nft: any = {
//         token_id,
//         contract_id: collection.id,
//         owner: to_address,
//         metadata_id: id,
//         type: type,
//         open_status: NftOpenStatus.NOT_OPEN,
//         metadata: JSON.stringify({
//             ...metadata,
//             name: name + " #" + token_id,
//         }),
//     };
//     await NftModel.create(nft, conn);
//     await BlockchainEventModel.create(nft_event, conn);
// };
//
// export const buyCharacterEvent = async (log_data: any, collection: any, log: any, blockchain: any, conn: any) => {
//     const type = Number(Web3Utils.hexToNumberString(log_data.args.typeCharacter));
//     const to_address = log_data.args.toAddress.toLowerCase();
//
//     const character = await CharacterModel.getByType("type", type);
//     const user = await UserModel.getByType("address", to_address);
//
//     await UserCharacterModel.create(
//         {
//             user_id: user.id,
//             character_id: character.id,
//         },
//         conn
//     );
// };
//
// const getTokenIdCollectionAndNft = async (log_data: any, nft_collections_list: any[], collectionType: any) => {
//     const collection_nft = nft_collections_list.find((x) => x.type == mapContractType[collectionType]);
//     const token_id = Web3Utils.hexToNumberString(log_data.args.tokenId);
//     if (!collection_nft) throw ErrorCode.COLLECTION_INVALID;
//     const nft = await NftModel.get_by_token_id(collection_nft.id, token_id);
//     return {token_id, collection_nft, nft};
// };
//
// const generateEvent = (log: any, metadata: any, type: BlockchainEventType, token_id: any, contract_id: number) => {
//     return {
//         transaction_hash: log.transactionHash,
//         token_id,
//         block_number: log.blockNumber,
//         contract_id,
//         type,
//         metadata,
//     };
// };
//
// // const generate_metadata = async (collection: any, conn?: any) => {
// //     const rareConfig = await ConfigModel.getByType(ConfigType.RARE_NFT_CONFIG);
// //     const nft_type_rate = rareConfig.metadata;
// //     const random = Math.random() * 100;
// //     let rare = 1;
// //     let type = 1;
// //     if (random < nft_type_rate[0]) {
// //         rare = 1;
// //         type = 4;
// //     }
// //     if (random >= nft_type_rate[0] && random < nft_type_rate[1]) {
// //         rare = 2;
// //         type = 3;
// //     }
// //     if (random >= nft_type_rate[1] && random < nft_type_rate[2]) {
// //         rare = 3;
// //         type = 2;
// //     }
// //     if (random >= nft_type_rate[2] && random < nft_type_rate[3]) {
// //         rare = 4;
// //         type = 1;
// //     }
// //     return NftMetadataModel.get_by_contract_and_rare_and_type(collection.id, rare, type);
// // };
