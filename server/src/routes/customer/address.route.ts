import { Router } from "express";
import { asyncHanlder } from "../../utils/asyncHandler";
import { getDbUserFromReq, requireAuth } from "../../middleware/auth";
import { User } from "../../models/user";
import { requireFound, textRequired } from "../../utils/helper";
import { ok } from "../../utils/envolve";
import { AppError } from "../../utils/AppError";

type AddressItem = {
  _id?: string;
  fullName: string;
  address: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

function mapAddress(item: any): AddressItem {
  return {
    _id: String(item._id || ""),
    fullName: item.fullName,
    address: item.address,
    state: item.state,
    postalCode: item.postalCode,
    isDefault: item.isDefault,
  };
}

export const customerAddressRoute = Router();

customerAddressRoute.use(requireAuth);

customerAddressRoute.get(
  "/addresses",
  asyncHanlder(async (req, res) => {
    const dbUser = await getDbUserFromReq(req);

    const user = await User.findById(dbUser._id);

    const foundUser = requireFound(user, "User not found", 404);

    const addresses = foundUser.addresses || [];

    const items: AddressItem[] = [...addresses]
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
      .map(mapAddress);

    res.json(ok(items));
  }),
);

customerAddressRoute.post(
  "/addresses",
  asyncHanlder(async (req, res) => {
    const dbUser = await getDbUserFromReq(req);

    const fullName = String(req.body.fullName);
    const address = String(req.body.address).trim();
    const state = String(req.body.state).trim();
    const postalCode = String(req.body.postalCode).trim();

    textRequired(fullName, "fullName is reqruied");
    textRequired(address, "address is reqruied");
    textRequired(state, "state is reqruied");
    textRequired(postalCode, "postalCode is reqruied");

    const user = await User.findById(dbUser._id);

    const foundUser = requireFound(user, "user not found", 404);

    const addresses = foundUser.addresses || [];

    const shouldMarlAsDefault =
      req.body.isDefault === true || addresses.length === 0;

    if (shouldMarlAsDefault) {
      addresses.forEach((item) => {
        item.isDefault = false;
      });
    }

    addresses.push({
      fullName,
      address,
      postalCode,
      state,
      isDefault: shouldMarlAsDefault,
    });

    await foundUser.save();

    const items: AddressItem[] = [...addresses]
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
      .map(mapAddress);

    res.json(ok(items));
  }),
);

customerAddressRoute.patch(
  "/addresses/:addressId",
  asyncHanlder(async (req, res) => {
    const dbUser = await getDbUserFromReq(req);

    const addressId = req.body.addressId.trim() as String;
    textRequired(addressId, "Address id is requried");

    const fullName = String(req.body.fullName);
    const address = String(req.body.address).trim();
    const state = String(req.body.state).trim();
    const postalCode = String(req.body.postalCode).trim();

    textRequired(fullName, "fullName is reqruied");
    textRequired(address, "address is reqruied");
    textRequired(state, "state is reqruied");
    textRequired(postalCode, "postalCode is reqruied");

    const user = await User.findById(dbUser._id);

    const foundUser = requireFound(user, "user not found", 404);

    const addresses = foundUser.addresses || [];

    const getAddressFromUser = addresses.find(
      (currentAddress) => String(currentAddress._id) === addressId,
    );

    if (!getAddressFromUser) {
      throw new AppError(404, "address not received");
    }

    const shouldMarlAsDefault =
      req.body.isDefault === true || addresses.length === 0;

    if (shouldMarlAsDefault) {
      addresses.forEach((item) => {
        item.isDefault = false;
      });
    }

    getAddressFromUser.fullName = fullName;
    getAddressFromUser.state = state;
    getAddressFromUser.postalCode = postalCode;
    getAddressFromUser.address = address;

    if (shouldMarlAsDefault) {
      getAddressFromUser.isDefault = true;
    }

    const newAddressSaved = await foundUser.save();

    res.json(ok(newAddressSaved));
  }),
);

customerAddressRoute.delete(
  "/addresses/:addressId",
  asyncHanlder(async (req, res) => {
    const dbUser = await getDbUserFromReq(req);
    const addressId = String(req.params.id).trim();
    textRequired(addressId, "Address id is required");

    const user = await User.findById(dbUser._id);
    const foundUser = requireFound(user, "user not found", 404);
    const addresses = foundUser.addresses || [];

    const IndexOfRemovingAddress = addresses.findIndex(
      (address) => String(address._id) === addressId,
    );

    if (IndexOfRemovingAddress < 0) {
      throw new AppError(404, "Address not found");
    }

    const wasDefault = addresses[IndexOfRemovingAddress].isDefault === true;

    addresses.splice(IndexOfRemovingAddress, 1);

    if (
      wasDefault &&
      addresses.length > 0 &&
      !addresses.some((address) => address.isDefault)
    ) {
      addresses[0].isDefault = true;
    }

    await foundUser.save();

    const items: AddressItem[] = [...foundUser.addresses]
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
      .map(mapAddress);

    res.json(ok({ items }));
  }),
);
