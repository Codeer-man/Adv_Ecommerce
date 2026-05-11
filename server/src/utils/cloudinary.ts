import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

type cloudinaryUploadResult = {
  publicId: string;
  url: string;
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadSingleBufferToCloudinary(
  fileBuffer: Buffer,
  folder = "dummy/product",
): Promise<cloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result) {
          return new Error("Cloudinary failed to upload");
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
}

export async function uploadManyBufferToCloudinary(
  files: Buffer[],
  folder = "dummy/product",
): Promise<cloudinaryUploadResult[]> {
  return Promise.all(
    files.map((files) => uploadSingleBufferToCloudinary(files, folder)),
  );
}
