// Require the cloudinary library
import { v2 as cloudinary } from 'cloudinary'
import {config} from "../config";

// Return "https" URLs by setting secure: true
cloudinary.config({...config.cloudinary});

const uploadImage = async (imagePath: string) => {

    // Use the uploaded file's name as the asset's public ID and
    // allow overwriting the asset with new versions
    const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
    };

    try {
        // Upload the image
        const result = await cloudinary.uploader.upload(imagePath, options);
        console.log(result);
        return result.public_id;
    } catch (error) {
        console.error(error);
    }
};

export const Cloudinary = {
    uploadImage
}
// Log the configuration

