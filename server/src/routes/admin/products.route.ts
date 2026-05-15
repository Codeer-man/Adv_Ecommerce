import { Router } from "express";
import multer, { memoryStorage } from "multer";
import {
  adminRequired,
  getDbUserFromReq,
  requireAuth,
} from "../../middleware/auth";
import { asyncHanlder } from "../../utils/asyncHandler";
import { Category } from "../../models/category";
import { ok } from "../../utils/envolve";
import { numberRequired, requireFound, textRequired } from "../../utils/helper";
import { Product } from "../../models/product";
import { AppError } from "../../utils/AppError";
import { uploadManyBufferToCloudinary } from "../../utils/cloudinary";
import { resolve } from "dns";

type uploadedImages = {
  url: string;
  publicId: string;
  isCover: boolean;
};

export const adminProductRouter = Router();

const upload = multer({
  storage: memoryStorage(),
  limits: {
    fieldSize: 5 * 1024 * 1024,
    files: 10,
  },
});

// adminProductRouter(requireAuth);

//category
adminProductRouter.get(
  "/categories",
  requireAuth,
  asyncHanlder(async (_req, res) => {
    const category = await Category.find({}).sort({
      name: 1,
    });

    res.jsonp(ok(category));
  }),
);

adminProductRouter.post(
  "/categories",
  adminRequired,
  asyncHanlder(async (req, res) => {
    const name = String(req.body.name).trim();
    textRequired(name, "Name is required");

    const category = Category.create({ name });

    res.status(201).json(ok(category));
  }),
);

adminProductRouter.put(
  "/categories/:id",
  adminRequired,
  asyncHanlder(async (req, res) => {
    const name = req.body.name;
    const existingCategoryId = req.params.id;
    textRequired(name, "Name of the category is required");

    const existingCategory = await Category.findById(existingCategoryId);
    const category = requireFound(existingCategory, "Category not found");

    category.name = name;

    await category.save();
    res.status(201).json(ok(category));
  }),
);

//products
adminProductRouter.get(
  "/products",
  adminRequired,
  asyncHanlder(async (req, res) => {
    const search = req.query.search;

    const query: Record<string, unknown> = {};

    if (search) {
      query.title = { $regex: search, options: "i" };
    }

    const products = await Product.find(query)
      .populate("name", "category")
      .sort({ createdAt: -1 });

    res.json(ok(products));
  }),
);

adminProductRouter.get(
  "/product/:id",
  asyncHanlder(async (req, res) => {
    const productId = req.params.id as string;

    const product = await Product.findById(productId).populate(
      "category",
      "name",
    );

    requireFound(product, "Product not found", 404);

    res.json(ok(product));
  }),
);

adminProductRouter.post(
  "/products",
  upload.array("images", 10),
  asyncHanlder(async (req, res) => {
    const title = String(req.body.title || "").trim();
    const description = String(req.body.description || "").trim();
    const category = String(req.body.category || "").trim();
    const brand = String(req.body.brand || "").trim();
    const price = Number(req.body.price);
    const salePercentage = Number(req.body.salePercentage);
    const stock = Number(req.body.stock);
    const status = String(req.body.status || "active").trim();
    const colors = req.body.color || [];
    const sizes = req.body.size || [];

    textRequired(title, "Title is required");
    textRequired(description, "description is required");
    textRequired(category, "category is required");
    textRequired(brand, "brand is required");

    numberRequired(price, "Price is requried");
    numberRequired(salePercentage, "sale percentage is required");
    numberRequired(stock, "stock is required");

    const existingCategory = await Category.findById(category);

    textRequired(existingCategory, "Category not found", 404);

    const files = (req.files as Express.Multer.File[]) || [];

    if (!files.length) {
      throw new AppError(400, "Atleast one image is required");
    }

    const uploadImage = await uploadManyBufferToCloudinary(
      files.map((files) => files.buffer),
    );

    const images = uploadImage.map((files, index) => ({
      url: files.url,
      publicId: files.publicId,
      isCoverImg: index,
    }));

    const user = await getDbUserFromReq(req);

    const product = await Product.create({
      title,
      description,
      category,
      brand,
      images: images,
      price,
      salePercentage,
      stock,
      status,
      colors,
      sizes,
      createdBy: user._id,
    });

    const createProduct = await Product.findById(product._id).populate(
      "category",
      "name",
    );

    res.status(201).json(ok(createProduct));
  }),
);

adminProductRouter.post(
  "/products/:id",
  upload.array("images", 10),
  asyncHanlder(async (req, res) => {
    const productId = String(req.params.id);
    const title = String(req.body.title || "").trim();
    const description = String(req.body.description || "").trim();
    const category = String(req.body.category || "").trim();
    const brand = String(req.body.brand || "").trim();
    const price = Number(req.body.price);
    const salePercentage = Number(req.body.salePercentage);
    const stock = Number(req.body.stock);
    const status = String(req.body.status || "active").trim() as
      | "active"
      | "inactive";
    const colors = req.body.color || [];
    const sizes = req.body.size || [];
    const coverImagePublicId = String(req.body.coverImagePublicId || "").trim();

    textRequired(title, "Title is required");
    textRequired(description, "description is required");
    textRequired(category, "category is required");
    textRequired(brand, "brand is required");

    numberRequired(price, "Price is requried");
    numberRequired(salePercentage, "sale percentage is required");
    numberRequired(stock, "stock is required");

    const existingCategoryDoc = await Category.findById(category);
    const existingCategory = requireFound(
      existingCategoryDoc,
      "category not found",
    );

    const productDoc = await Product.findById(productId);
    const product = requireFound(productDoc, "Product not found");

    const files = (req.files as Express.Multer.File[]) || [];

    const uploadNewImages = await uploadManyBufferToCloudinary(
      files.map((files) => files.buffer),
    );

    const newlyAddedImages = uploadNewImages.map((image) => ({
      url: image.url,
      publicId: image.publicId,
      isCover: false,
    }));

    let existingImages: uploadedImages[] = product.images.map((images) => ({
      url: images.url,
      publicId: images.publicId,
      isCover: images.isCoverImg,
    }));

    const mergeImages: uploadedImages[] = [
      ...existingImages,
      ...newlyAddedImages,
    ];

    if (!mergeImages) {
      throw new AppError(400, "At least one image is requried");
    }

    const finalImages: uploadedImages[] = mergeImages.map(
      (images: uploadedImages, index) => ({
        url: images.url,
        publicId: images.publicId,
        isCover: coverImagePublicId
          ? images.publicId === coverImagePublicId
          : index === 0,
      }),
    );

    product.title = title;
    product.description = description;
    product.category = existingCategory._id;
    product.brand = brand;
    product.colors = colors;
    product.sizes = sizes;
    product.price = price;
    product.salePercentage = salePercentage;
    product.stock = stock;
    product.status = status;
    product.set("images", finalImages);

    await product.save();

    const updatedProduct = await Product.findById(productId).populate(
      "category",
      "name",
    );

    res.json(ok(updatedProduct));
  }),
);
