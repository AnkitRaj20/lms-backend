import { Router } from "express";
import userRouter from "./user.route.js";
import courseRouter from "./course.route.js";

const router = Router();

router.use("/user", userRouter);
router.use("/course", courseRouter);

export default router;
