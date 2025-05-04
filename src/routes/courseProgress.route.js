import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  getUserCourseProgress,
  updateLectureProgress,
  markCourseAsCompleted,
  resetCourseProgress,
  getCourseCertificate,
} from "../controllers/courseProgress.controller.js";

const courseProgressRouter = express.Router();

// Get course progress
courseProgressRouter.get("/:courseId", verifyToken, getUserCourseProgress);

// Update lecture progress
courseProgressRouter.patch(
  "/:courseId/lectures/:lectureId",
  verifyToken,
  updateLectureProgress
);

// Mark course as completed
courseProgressRouter.patch(
  "/:courseId/complete",
  verifyToken,
  markCourseAsCompleted
);

// Reset course progress
courseProgressRouter.patch(
  "/:courseId/reset",
  verifyToken,
  resetCourseProgress
);

courseProgressRouter.get(
  "/certificate/:courseId",
  verifyToken,
  getCourseCertificate
);

export default courseProgressRouter;
