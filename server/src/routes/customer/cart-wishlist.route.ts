import e, { Router, type Request, type Response } from "express";
import { getDbUserFromReq, requireAuth } from "../../middleware/auth";
import { Product, ProductSize } from "../../models/product";
import { asyncHanlder } from "../../utils/asyncHandler";
import { ok } from "../../utils/envolve";

import { Types } from "mongoose";
import { Cart, CartItem } from "../../models/cart";
import { AppError } from "../../utils/AppError";
import { numberRequired, requireFound, textRequired } from "../../utils/helper";

export const customerCartWishlistRouter = Router();

type ProductPreview = {
  _id: string;
  title: string;
  brand: string;
  price: number;
  salePercentage: number;
  images: Array<{
    url: string;
    isCover?: boolean;
  }>;
};

type CartPreviewItem = {
  product: ProductPreview;
  quantity: number;
  color?: string;
  size?: ProductSize;
};

type SyncCartItemInput = {
  productId?: string;
  quantity?: number;
  color?: string;
  size?: ProductSize;
};

function formatProduct(product: ProductPreview) {
  const image =
    product.images.find((item) => item.isCover)?.url ||
    product.images[0].url ||
    "";

  const findPrice = product.salePercentage
    ? Math.round(product.price - (product.price * product.salePercentage) / 100)
    : product.price;

  return {
    _id: product._id,
    title: product.title,
    brand: product.brand,
    coverImage: image,
    image: product.images,
    findPrice,
  };
}

async function getCartResponse(userId: string) {
  const cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    " title brand price salePercentage images",
  );

  // some type error big in here so using this
  const cartItem = (cart?.items || []) as unknown as CartPreviewItem[];

  const items = cartItem.flatMap((items) => {
    if (!items) return [];

    return [
      {
        ...formatProduct(items.product),
        quantity: items.quantity,
        color: items.color,
        size: items.size,
      },
    ];
  });

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    totalQuantity,
  };
}

function getSelectedValue(
  product: { colors: string[]; sizes: ProductSize[] },
  colorValue: string,
  sizeValue: string,
) {
  let color: string | undefined;
  let size: ProductSize | undefined;

  if (product.colors.length > 0) {
    if (!colorValue) {
      throw new AppError(400, "Color is required");
    }

    if (!product.colors.includes(colorValue)) {
      throw new AppError(400, "Color is not present");
    }

    color = colorValue;
  }

  if (product.sizes.length > 0) {
    if (!sizeValue) {
      throw new AppError(400, "size is required");
    }

    if (!product.sizes.includes(sizeValue as ProductSize)) {
      throw new AppError(400, "size is not present");
    }

    size = sizeValue as ProductSize;
  }

  return {
    color,
    size,
  };
}

function isSameCartItem(
  item: CartItem,
  productId: string,
  color?: string,
  size?: string,
) {
  return (
    String(item.product) === productId &&
    (item.color || "") === (color || "") &&
    (item.size || "") === (size || "")
  );
}

customerCartWishlistRouter.use(requireAuth);

customerCartWishlistRouter.get(
  "/cart",
  asyncHanlder(async (req: Request, res: Response) => {
    const dbUser = await getDbUserFromReq(req);

    res.json(
      ok({
        data: await getCartResponse(String(dbUser._id)),
      }),
    );
  }),
);

customerCartWishlistRouter.post(
  "/cart/items",
  asyncHanlder(async (req, res) => {
    const dbUser = await getDbUserFromReq(req);

    const productId = String(req.body.productId || "").trim();
    const quantity = Number(req.body.quantity || 1);
    const colorValue = String(req.body.color || "");
    const sizeValue = String(req.body.size || "");

    if (Number.isNaN(quantity || quantity < 1)) {
      throw new AppError(400, "Quantity must be atleast 1");
    }

    const product = await Product.findOne({
      _id: productId,
      status: "active",
    });

    const foundProduct = requireFound(product, "Product not found", 404);

    const { color, size } = getSelectedValue(
      foundProduct,
      colorValue,
      sizeValue,
    );

    if (quantity > foundProduct.stock) {
      throw new AppError(400, "Quantity is more than stock of this product");
    }

    let cart = await Cart.findOne({ user: dbUser._id });

    if (!cart) {
      cart = await Cart.create({
        user: dbUser._id,
        items: [],
      });
    }

    const itemIndex = cart.items.findIndex((item: CartItem) =>
      isSameCartItem(item, String(foundProduct._id), color, size),
    );

    numberRequired(itemIndex, "");

    if (itemIndex > 0) {
      const newQuantity = cart.items[itemIndex].quantity + quantity;

      if (newQuantity > foundProduct.stock) {
        throw new AppError(
          400,
          "Quantity is more than the stock of this product",
        );
      }

      cart.items[itemIndex].quantity = newQuantity;
    } else {
      cart.items.push({
        product: foundProduct._id,
        quantity,
        color,
        size,
      });
    }

    await cart.save();

    res.json(ok(await getCartResponse(String(dbUser._id))));
  }),
);

customerCartWishlistRouter.patch(
  "/cart/item/:productId/increase",
  asyncHanlder(async (req, res) => {
    const dbUser = await getDbUserFromReq(req);

    const productId = String(req.params.productId);
    const colorValue = String(req.body.colorValue || "").trim();
    const sizeValue = String(req.body.sizeValue || "").trim();

    textRequired(productId, "Product id is required");
    const cart = await Cart.findOne({ user: dbUser._id });
    const foundCart = requireFound(cart, "cart not found", 404);

    const product = await Product.findOne({
      _id: productId,
      status: "active",
    });

    const foundProduct = requireFound(product, "Product not found", 404);

    const { color, size } = getSelectedValue(
      foundProduct,
      colorValue,
      sizeValue,
    );

    const itemIndex = foundCart.items.findIndex((item: CartItem) => {
      isSameCartItem(item, String(foundProduct._id), color, size);
    });

    if (itemIndex < 0) {
      throw new AppError(400, "cart item not found here");
    }

    if (foundCart.items[itemIndex].quantity + 1 > foundProduct.stock) {
      throw new AppError(400, "Quantity is more than the stock of the product");
    }

    foundCart.items[itemIndex].quantity += 1;

    await foundCart.save();

    res.json(ok(await getCartResponse(String(dbUser._id))));
  }),
);

customerCartWishlistRouter.patch(
  "/cart/item/:productId/decrease",
  asyncHanlder(async (req, res) => {
    const dbUser = await getDbUserFromReq(req);

    const productId = String(req.params.productId);
    const colorValue = String(req.body.colorValue || "").trim();
    const sizeValue = String(req.body.sizeValue || "").trim();

    textRequired(productId, "Product id is required");
    const cart = await Cart.findOne({ user: dbUser._id });
    const foundCart = requireFound(cart, "cart not found", 404);

    const product = await Product.findOne({
      _id: productId,
      status: "active",
    });

    const foundProduct = requireFound(product, "Product not found", 404);

    const { color, size } = getSelectedValue(
      foundProduct,
      colorValue,
      sizeValue,
    );

    const itemIndex = foundCart.items.findIndex((item: CartItem) => {
      isSameCartItem(item, String(foundProduct._id), color, size);
    });

    if (itemIndex < 0) {
      throw new AppError(400, "cart item not found here");
    }

    foundCart.items[itemIndex].quantity -= 1;

    if (foundCart.items[itemIndex].quantity <= 0) {
      foundCart.items.splice(itemIndex, 1);
    }

    await foundCart.save();

    res.json(ok(await getCartResponse(String(dbUser._id))));
  }),
);

customerCartWishlistRouter.delete(
  "/cart/item/:productId",
  asyncHanlder(async (req, res) => {
    const dbUser = await getDbUserFromReq(req);

    const productId = String(req.params.productId);
    const colorValue = String(req.body.colorValue || "").trim();
    const sizeValue = String(req.body.sizeValue || "").trim();

    textRequired(productId, "Product id is required");

    const cart = await Cart.findOne({ user: dbUser._id });

    if (!cart) {
      res.json(
        ok({
          items: [],
          totalQuantity: 0,
        }),
      );
      return;
    }

    const product = await Product.findOne({ _id: productId, status: "active" });

    const foundProduct = requireFound(product, "Product not found", 404);

    const { color, size } = getSelectedValue(
      foundProduct,
      colorValue,
      sizeValue,
    );

    cart.items = cart.items.filter(
      (item: CartItem) =>
        !isSameCartItem(item, String(foundProduct._id), color, size),
    );

    await cart.save();

    res.json(ok(await getCartResponse(String(dbUser._id))));
  }),
);

customerCartWishlistRouter.post(
  "/cart/sync",
  asyncHanlder(async (req, res) => {
    const dbUser = await getDbUserFromReq(req);

    const incomingItems = Array.isArray(req.body.items)
      ? (req.body.items as SyncCartItemInput[])
      : [];

    let cart = await Cart.findOne({ user: dbUser._id });

    if (!cart) {
      cart = await Cart.create({
        user: dbUser._id,
        items: [],
      });
    }

    for (const rawItem of incomingItems) {
      const productId = String(rawItem.productId || "").trim();
      const quantity = Number(rawItem.quantity || 0);
      const colorValue = String(rawItem.color || "").trim();
      const sizeValue = String(rawItem.size || "").trim();

      if (!productId || Number.isNaN(quantity) || quantity < 1) {
        continue;
      }

      const product = await Product.findOne({
        _id: productId,
        status: "active",
      });

      if (!product || product.stock < 1) {
        continue;
      }

      try {
        const { color, size } = getSelectedValue(
          product,
          colorValue,
          sizeValue,
        );

        const itemIndex = cart.items.findIndex((item: CartItem) =>
          isSameCartItem(item, String(product._id), color, size),
        );

        if (itemIndex >= 0) {
          const nextQuantity = cart.items[itemIndex].quantity + quantity;

          cart.items[itemIndex].quantity = Math.min(
            nextQuantity,
            product.stock,
          );
        } else {
          cart.items.push({
            product: product._id,
            quantity: Math.min(quantity, product.stock),
            color,
            size,
          });
        }
      } catch {
        continue;
      }

      await cart.save();

      res.json(ok(await getCartResponse(String(dbUser._id))));
    }
  }),
);
