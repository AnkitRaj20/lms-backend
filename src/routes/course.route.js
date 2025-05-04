import { Router } from "express";
import { restrictTo, verifyToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  addLectureToCourse,
  createNewCourse,
  getCourseDetails,
  getCourseLectures,
  getMyCreatedCourses,
  getPublishedCourses,
  reviewCourse,
  searchCourses,
  updateCourseDetails,
} from "../controllers/course.controller.js";
import { RoleTypes } from "../constants/constant.js";

const courseRouter = Router();

// Public routes
courseRouter.get("/published", getPublishedCourses);
courseRouter.get("/search", searchCourses);

// Protected routes
courseRouter.use(verifyToken);

// Only instructors can create new courses
// Course Management
courseRouter
  .route("/")
  .post(
    restrictTo(RoleTypes.INSTRUCTOR),
    upload.single("thumbnail"),
    createNewCourse
  )
  .get(restrictTo(RoleTypes.INSTRUCTOR), getMyCreatedCourses);

// Course details and updates
courseRouter
  .route("/:id")
  .get(getCourseDetails)
  .patch(restrictTo(RoleTypes.INSTRUCTOR), updateCourseDetails);

// Lecture management
courseRouter
  .route("/:id/lectures")
  .get(getCourseLectures)
  .post(
    restrictTo(RoleTypes.INSTRUCTOR),
    upload.single("video"),
    addLectureToCourse
  );

courseRouter.route("/review/:courseId").patch(reviewCourse)
export default courseRouter;
