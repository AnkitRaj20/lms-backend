import { Router } from "express";
import { restrictTo, verifyToken } from "../middlewares/auth.middleware.js";
import { RoleTypes } from "../constants/constant.js";
import { dashboardData } from "../controllers/admin.controller.js";

const adminRouter = Router();

adminRouter
  .route("/dashboard")
  .get(verifyToken, restrictTo(RoleTypes.ADMIN), dashboardData);

export default adminRouter;
