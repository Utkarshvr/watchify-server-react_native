const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
cloudinary.config({
  cloud_name: "uv-codes",
  api_key: "474949263294419",
  api_secret: "qvNZfzs_Mr_CIdAM65eV0o6jZwo",
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file on Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // File has been uploaded
    console.log("File is uploaded on cloudinary!", response.url);

    // Remove file from local storage
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    // Remove the locally saved temporary file as the upload operation got failed
    fs.unlinkSync(localFilePath);
    return error;
  }
};
module.exports = { uploadOnCloudinary };
