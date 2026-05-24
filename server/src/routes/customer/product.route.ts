import { Router, type Request, type Response } from "express";
import { asyncHanlder } from "../../utils/asyncHandler";
import { Category } from "../../models/category";
import { ok } from "../../utils/envolve";
import { Product } from "../../models/product";
import { requireFound } from "../../utils/helper";

export const customerProductRouter = Router();

type ProductSort = "recent" | "price-low" | "price-high";

type ProductAppledFilterListQuery = {
  category?: string;
  brand?: string;
  color?: string;
  size?: string;
  sort?: ProductSort;
};

customerProductRouter.get(
  "/categpries",
  asyncHanlder(async (_req, res) => {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(ok(categories));
  }),
);

customerProductRouter.get(
  "/products",
  asyncHanlder(
    async (req: Request<{}, {}, {}, ProductAppledFilterListQuery>, res) => {
      const category = (req.query.category || "").trim();
      const brand = (req.query.brand || "").trim();
      const color = (req.query.color || "").trim();
      const size = (req.query.size || "").trim();
      const sort: ProductSort = req.query.sort || "recent";

      const query: Record<string, unknown> = {
        status: "active",
      };

      if (category) {
        query.category = category;
      }
      if (brand) {
        query.brand = brand;
      }
      if (color) {
        query.category = color;
      }
      if (size) {
        query.size = size;
      }

      let sortOption: Record<string, 1 | -1> = {
        createdAt: -1,
      };

      if (sort === "price-high") {
        sortOption = { price: 1 };
      }

      if (sort === "price-low") {
        sortOption = { price: -1 };
      }

      const products = await Product.find(query)
        .populate("category", "name")
        .sort(sortOption);

      res.json(ok(products));
    },
  ),
);

customerProductRouter.get(
  "/product/:id",
  asyncHanlder(async (req, res) => {
    const ProductId = req.params.id;
    const product = await Product.findOne({
      _id: ProductId,
      status: "active",
    }).populate("category", "name");

    const foundProduct = requireFound(product, "Product not found", 404);

    const relatedProduct = await Product.find({
      _id: { $ne: foundProduct._id },
      status: "active",
      category: foundProduct.category,
    })
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(ok({ product: foundProduct, related_Product: relatedProduct }));
  }),
);
