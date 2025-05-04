import express from "express";

import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  createRazorpayOrder,
  getCoursePurchaseStatus,
  getPurchasedCourses,
  verifyRazorpayPayment,
} from "../controllers/razorpay.controller.js";

const coursePurchaseRouter = express.Router();

// Create Razorpay order for course purchase

coursePurchaseRouter.post("/checkout", verifyToken, createRazorpayOrder);
coursePurchaseRouter.post("/verify", verifyToken, verifyRazorpayPayment);

coursePurchaseRouter
  .route("/:courseId/detail-with-status")
  .get(verifyToken, getCoursePurchaseStatus);

coursePurchaseRouter.route("/").get(verifyToken, getPurchasedCourses);

export default coursePurchaseRouter;
