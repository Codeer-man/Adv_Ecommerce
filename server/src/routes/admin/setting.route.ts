import multer from "multer";
import { Banner, BannerDoc } from "../../models/banner";
import { type Request, type Response, Router } from "express";
import { adminRequired, getDbUserFromReq } from "../../middleware/auth";
import { asyncHanlder } from "../../utils/asyncHandler";
import { ok } from "../../utils/envolve";
import { AppError } from "../../utils/AppError";
import { uploadManyBufferToCloudinary } from "../../utils/cloudinary";

type AdminBannerItem = {
  _id: string;
  imageUrl: string;
  imagePublicId: string;
  createdAt: string;
};

function mapBanner(item: BannerDoc): AdminBannerItem {
  return {
    _id: String(item._id),
    imageUrl: item.imageUrl,
    imagePublicId: item.imagePublicId,
    createdAt: item.createdAt.toISOString(),
  };
}

const BANNER_FOLDER = "ecommerce-monster-video/banners";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: 5 * 1024 * 1024,
    files: 10,
  },
});

export const adminSettingsRouter = Router();

adminSettingsRouter.use(adminRequired);

adminSettingsRouter.get(
  "/settings/banners",
  asyncHanlder(async (_req: Request, res: Response) => {
    const items = await Banner.find().sort({ createdAt: -1 });

    res.json(
      ok({
        items: items.map(mapBanner),
      }),
    );
  }),
);

adminSettingsRouter.post(
  "/settings/banners",
  upload.array("images", 10),
  asyncHanlder(async (req: Request, res: Response) => {
    const dbUser = await getDbUserFromReq(req);

    const files = (req.files || []) as Express.Multer.File[];

    if (!files.length) {
      throw new AppError(400, "At least one image is required");
    }

    const uploadedImages = await uploadManyBufferToCloudinary(
      files.map((file) => file.buffer),
      BANNER_FOLDER,
    );

    const createFinalBanners = await Banner.insertMany(
      uploadedImages.map((item) => ({
        imageUrl: item.url,
        imagePublicId: item.publicId,
        createdBy: dbUser._id,
      })),
    );

    res.json(
      ok({
        items: createFinalBanners.map(mapBanner),
      }),
    );
  }),
);
