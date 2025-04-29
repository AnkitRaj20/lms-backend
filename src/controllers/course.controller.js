import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import ApiError from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";

export const createNewCourse = asyncHandler(async (req, res) => {
  // TODO: Implement create new course functionality
  const { title, description, category, price, level } = req.body;
  const instructor = req.user._id; // Assuming the instructor is the logged-in user

  if (req?.file) {
    const thumbnailLocalPath = req.file.path;
    const thumbnailCloudPath = await uploadOnCloudinary(thumbnailLocalPath);

    req.body.thumbnail = thumbnailCloudPath?.secure_url;
  }

  const newCourse = await Course.create({
    title,
    description,
    category,
    price,
    level,
    instructor,
    thumbnail: req.body.thumbnail,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newCourse, "Course created successfully"));
});

/**
 * Search courses with filters
 * @route GET /api/v1/courses/search
 */
export const searchCourses = asyncHandler(async (req, res) => {
  // TODO: Implement search courses functionality
  const { title, category, level } = req.query;

  const filters = {};

  if (title) filters.title = { $regex: title, $options: "i" };
  if (category) filters.category = category;
  if (level) filters.level = level;

  const courses = await Course.find(filters)
    .populate("instructor", "name avatar")
    .sort({ createdAt: -1 });

  if (!courses || courses.length === 0) {
    throw new ApiError("No courses found with the given filters");
  }

  return res.status(200).json(new ApiResponse(200, courses, "Courses found"));
});

/**
 * Get all published courses
 * @route GET /api/v1/courses/published
 */
export const getPublishedCourses = asyncHandler(async (req, res) => {
  // TODO: Implement get published courses functionality
  const courses = await Course.find({ isPublished: true }).populate(
    "instructor",
    "name avatar"
  );

  if (!courses || courses.length === 0) {
    throw new ApiError("No published courses found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, courses, "Published courses found"));
});

/**
 * Get courses created by the current user
 * @route GET /api/v1/courses/my-courses
 */
export const getMyCreatedCourses = asyncHandler(async (req, res) => {
  // TODO: Implement get my created courses functionality
  const instructor = req.user._id;

  const myCourses = await Course.find({ instructor }).populate(
    "instructor",
    "name avatar"
  );
  if (!myCourses || myCourses.length === 0) {
    throw new ApiError("No courses found for the current user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, myCourses, "My created courses found"));
});

/**
 * Update course details
 * @route PATCH /api/v1/courses/:courseId
 */
export const updateCourseDetails = asyncHandler(async (req, res) => {
  // TODO: Implement update course details functionality
  const { id: courseId } = req.params;
  const instructor = req.user._id; // Assuming the instructor is the logged-in user

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }
  if (course.instructor.toString() !== instructor.toString()) {
    throw new ApiError(403, "You are not authorized to update this course");
  }

  if (req?.file) {
    const thumbnailLocalPath = req.file.path;
    const thumbnailCloudPath = await uploadOnCloudinary(thumbnailLocalPath);

    req.body.thumbnail = thumbnailCloudPath?.secure_url;
  }

  const updatedCourse = await Course.findByIdAndUpdate(courseId, req.body, {
    new: true,
  });

  if (!updatedCourse) {
    throw new ApiError(404, "Course not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCourse, "Course updated successfully"));
});

/**
 * Get course by ID
 * @route GET /api/v1/courses/:courseId
 */
export const getCourseDetails = asyncHandler(async (req, res) => {
  // TODO: Implement get course details functionality
  const { id: courseId } = req.params;
  const course = await Course.findById(courseId).populate(
    "instructor",
    "name avatar"
  );

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, course, "Course details retrieved successfully")
    );
});

/**
 * Add lecture to course
 * @route POST /api/v1/courses/:courseId/lectures
 */
export const addLectureToCourse = asyncHandler(async (req, res) => {
  // TODO: Implement add lecture to course functionality
  const { id: courseId, order } = req.params;

  const { title, description } = req.body;

  const instructor = req.user._id; // Assuming the instructor is the logged-in user

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (course.instructor.toString() !== instructor.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to add lectures to this course"
    );
  }

  if (req?.file) {
    const videoLocalPath = req.file.path;
    const videoCloudPath = await uploadOnCloudinary(videoLocalPath);

    req.body.videoUrl = videoCloudPath?.secure_url;
  }

  const lecture = await Lecture.create({
    title,
    description,
    videoUrl: req.body.videoUrl,
    order,
  });
  course.lectures.push(lecture._id);

  await course.save();
  await lecture.save();

  return res
    .status(201)
    .json(
      new ApiResponse(201, lecture, "Lecture added to course successfully")
    );
});

/**
 * Get course lectures
 * @route GET /api/v1/courses/:courseId/lectures
 */
export const getCourseLectures = asyncHandler(async (req, res) => {
  // TODO: Implement get course lectures functionality

  const { id: courseId } = req.params;

  // const course = await Course.findById(courseId).populate("lectures");
  // if (!course) {
  //   throw new ApiError(404, "Course not found");
  // }

  const lectures = await Lecture.find({ course: courseId }).populate(
    "course",
    "title description thumbnail price lessons instructor level"
  );

  if (!lectures || lectures.length === 0) {
    throw new ApiError(404, "No lectures found for this course");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, lectures, "Course lectures retrieved successfully")
    );
});
