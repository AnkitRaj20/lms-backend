import { Router } from "express";
import {
  addWishListController,
  getWishListController,
  removeWishListController,
} from "../controllers/wishlist.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

const WishlistRouter = Router();

WishlistRouter
  .route("/:courseId")
  .post(verifyToken, addWishListController)
  .get(verifyToken, getWishListController)
  .delete(verifyToken, removeWishListController);

export default WishlistRouter;
