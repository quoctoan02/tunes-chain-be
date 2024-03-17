import {ContractModel, NftMetadataModel, NftModel} from "../models";
import {ConfigKey, ErrorCode, Utils} from "../utils";
import {ConfigModel} from "../models/config.model";

export class NftController {
    public static async create(data: any) {

    }

    public static async list(data: any) {

    }

    public static async fname() {

    }

    // public static async openBoxNft(userId: number, address: string, token_id: number) {
    //     const nftCollection = await ContractModel.getByType("address", address.toLowerCase());
    //     if (!nftCollection) throw ErrorCode.ADDRESS_INVALID;
    //
    //     const nft = await NftModel.get(nftCollection.id, token_id);
    //     if (!nft) throw ErrorCode.NFT_NOT_EXISTS;
    //
    //     if (nft.status == NftStatus.OPENED) throw ErrorCode.NFT_OPENED;
    //
    //     const user = await UserModel.get(userId);
    //     if (!user || user.address.toLowerCase() != nft.owner.toLowerCase()) throw ErrorCode.NOT_OWNER_OF_NFT;
    //
    //     const nft_metadata = await this.getRandomNftMetadata();
    //     const { id, name, ...metadata } = nft_metadata;
    //     const gem: any = {
    //         id: nft.id,
    //         metadata_id: id,
    //         metadata: JSON.stringify({
    //             ...metadata,
    //             name: name + " #" + token_id,
    //             metadata_id: id,
    //         }),
    //     };
    //     const result = await NftModel.open_box_nft(gem);
    //     return result ? await this.get(address, token_id, userId) : null;
    // }

    public static async getRandomNftMetadata() {
        const rareConfig = await ConfigModel.getByKey(ConfigKey.RARE_NFT_CONFIG);
        const nft_type_rate = rareConfig.metadata;
        const rare = this.getRandomRare(nft_type_rate);
        return NftMetadataModel.get_by_rare(rare);
    }

    public static getRandomRare(data: any) {
        const random = Math.floor(Math.random() * 10);
        let result = 1;
        if (random < data[0]) result = 1;
        if (random >= data[0] && random < data[1]) result = 2;
        if (random >= data[1] && random < data[2]) result = 3;
        if (random >= data[2] && random < data[3]) result = 4;
        if (random >= data[3] && random < data[4]) result = 5;
        if (random >= data[4] && random < data[5]) result = 6;
        return result;
    }
}