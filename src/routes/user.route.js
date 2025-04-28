import { Router } from "express";
import {
  changeUserPassword,
  getUserProfile,
  loginUser,
  logoutUser,
  registerUser,
  updateProfile,
} from "../controllers/user.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validateSignup } from "../middlewares/validate.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);

//! Secured routes
userRouter.route("/logout").get(verifyToken, logoutUser);
userRouter.route("/").get(verifyToken, getUserProfile);
userRouter.route("/").patch(verifyToken, upload.single("avatar"), updateProfile);
userRouter.route("/change-password").patch(verifyToken, changeUserPassword);

export default userRouter;
