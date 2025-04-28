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
