import { WishList } from "../models/wishlist.model.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";

export const addWishListController = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const wishList = await WishList.findOne({ user: req.user._id });

  if (!wishList) {
    const newWishList = await WishList.create({
      user: req.user._id,
      courses: [courseId],
    });
    return res
      .status(201)
      .json(new ApiResponse(201, newWishList, "Course added to wishlist"));
  }

  if (wishList.courses.includes(courseId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Course already in wishlist"));
  }

  wishList.courses.push(courseId);
  await wishList.save();

  return res
    .status(200)
    .json(new ApiResponse(200, wishList, "Course added to wishlist"));
});

export const getWishListController = asyncHandler(async (req, res) => {
  const wishList = await WishList.findOne({ user: req.user._id }).populate({
    path: "courses",
    select: "-enrolledStudents -lectures  -__v -createdAt -updatedAt ",
    populate: {
      path: "instructor",
      select: "name avatar",
    },
  });

  if (!wishList) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "No courses in the wishlist"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, wishList, "Wishlist retrieved successfully"));
});

export const removeWishListController = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const wishList = await WishList.findOne({ user: req.user._id });

  if (!wishList) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "No courses in the wishlist"));
  }

  if (!wishList.courses.includes(courseId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Course not in wishlist"));
  }
  

  wishList.courses = wishList.courses.filter((course) => course.toString() !== courseId);
  await wishList.save();

  return res
    .status(200)
    .json(new ApiResponse(200, wishList, "Course removed from wishlist"));
});
