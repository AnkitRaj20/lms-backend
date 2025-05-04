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
  const {
    query = "",
    categories = [],
    level,
    priceRange,
    sortBy = "newest",
  } = req.query;

  // Create search query
  const searchCriteria = {
    isPublished: true,
    $or: [
      { title: { $regex: query, $options: "i" } },
      { subtitle: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  };

  // Apply filters
  if (categories.length > 0) {
    searchCriteria.category = { $in: categories };
  }
  if (level) {
    searchCriteria.level = level;
  }

  if (priceRange) {
    const [min, max] = priceRange.split("-");
    searchCriteria.price = { $gte: min || 0, $lte: max || Infinity };
  }
  // Define sorting
  const sortOptions = {};
  switch (sortBy) {
    case "price-low":
      sortOptions.price = 1;
      break;
    case "price-high":
      sortOptions.price = -1;
      break;
    case "oldest":
      sortOptions.createdAt = 1;
      break;
    default:
      sortOptions.createdAt = -1;
  }

  const courses = await Course.find(searchCriteria)
    .populate("instructor", "name avatar")
    .sort(sortOptions);

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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  // const courses = await Course.find({ isPublished: true }).populate(
  //   "instructor",
  //   "name avatar"
  // );

  const [courses, total] = await Promise.all([
    Course.find({ isPublished: true })
      .populate({
        path: "instructor",
        select: "name avatar",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Course.countDocuments({ isPublished: true }),
  ]);

  // if (total === 0) {
  //   throw new ApiError(404,"No published courses found");
  // }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        courses,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Published courses found"
    )
  );
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
  const course = await Course.findById(courseId)
    .populate("instructor", "name avatar bio")
    .populate("lectures", "title description videoUrl order isPreview");

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...course.toJSON(),
        averageRating: course.averageRating,
      },
      "Course details retrieved successfully"
    )
  );
});

/**
 * Add lecture to course
 * @route POST /api/v1/courses/:courseId/lectures
 */
export const addLectureToCourse = asyncHandler(async (req, res) => {
  // TODO: Implement add lecture to course functionality
  const { id: courseId } = req.params;

  const { title, description, isPreview } = req.body;

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

  // Handle video upload
  if (!req.file) {
    throw new ApiError(404, "Video file is required");
  }

  const videoLocalPath = req.file.path;
  const videoCloudPath = await uploadOnCloudinary(videoLocalPath);

  console.log("videoCloudPath from cloudinary", videoCloudPath);

  const lecture = await Lecture.create({
    title,
    description,
    isPreview,
    videoUrl: videoCloudPath?.secure_url,
    publicId: videoCloudPath?.public_id,
    order: course.lectures.length + 1,
    duration: videoCloudPath?.duration || 0, // Cloudinary provides duration for video files
  });
  course.lectures.push(lecture._id);

  await course.save();

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

  const course = await Course.findById(courseId).populate({
    path: "lectures",
    select: "title description videoUrl duration order isPreview",
    options: {
      sort: { order: 1 }, // Sort lectures by order
    },
  });
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const isEnrolled = course.enrolledStudents.includes(req.user.id);
  const isInstructor = course.instructor.toString() === req.user.id;

  let lectures = course.lectures;

  if (!isEnrolled && !isInstructor) {
    // Only return preview lectures for non-enrolled users
    lectures = lectures.filter((lecture) => lecture.isPreview);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        lectures,
        isEnrolled,
        isInstructor,
      },
      "Course lectures retrieved successfully"
    )
  );
});

export const reviewCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { rating } = req.body;

  console.log(rating, "rating from body");

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (course.instructor.toString() === req.user._id.toString()) {
    throw new ApiError(403, "You cannot rate your own course");
  }

  const isPurchased = course.enrolledStudents.find(
    (s) => s.toString() === req.user._id.toString()
  );

  if (!isPurchased) {
    throw new ApiError(403, "You must purchase the course to rate it");
  }

  console.log("course>>>>>", course);

  const alreadyRated = course.ratings.find(
    (r) => r.ratedBy.toString() === req.user._id.toString()
  );

  if (alreadyRated) {
    course.ratings.forEach((r) => {
      if (r.ratedBy.toString() === req.user._id.toString()) {
        r.rating = rating;
      }
    });
  } else {
    course.ratings.push({
      ratedBy: req.user._id,
      rating: rating,
    });
  }

  // let avgRating = 0;
  // course.ratings.forEach((r) => {
  //   avgRating += r.rating;
  // })

  // course.averageRating = avgRating / course.ratings.length;
  await course.save();

  return res
    .status(200)
    .json(new ApiResponse(200, course, "Course rated successfully"));
});
