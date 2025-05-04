import { Router } from "express";
import userRouter from "./user.route.js";
import courseRouter from "./course.route.js";
import courseProgressRouter from "./courseProgress.route.js";
import coursePurchaseRouter from "./coursePurchase.route.js";
import adminRouter from "./admin.route.js";
import WishlistRouter from "./wishlist.route.js";

const router = Router();

router.use("/user", userRouter);
router.use("/course", courseRouter);
router.use("/courseProgress", courseProgressRouter);
router.use("/purchase", coursePurchaseRouter);
router.use("/admin", adminRouter);
router.use("/wishlist", WishlistRouter);

export default router;
