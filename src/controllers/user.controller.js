import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { cookieOptions, RoleTypes } from "../constants/constant.js";

import { createToken } from "../middlewares/auth.middleware.js";
import {
  deleteVideoFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.util.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = RoleTypes.STUDENT } = req.body;

  // Check if user exists
  const existedUser = await User.findOne({ email: email.toLowerCase() });

  if (existedUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  const token = createToken(user._id);

  //* Converts Mongoose document to plain JS object, this will allow us to add extra property to the object
  const newUser = user.toObject();
  newUser.token = token;

  await user.updateLastActive();

  return res
    .status(201)
    .cookie("token", token, cookieOptions)
    .json(new ApiResponse(201, newUser, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );
  if (!user || !(await user.isPasswordCorrect(password, user.password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  await user.updateLastActive();
  const token = createToken(user._id);
  const newUser = user.toObject();
  newUser.token = token;

  return res
    .status(200)
    .cookie("token", token, cookieOptions)
    .json(new ApiResponse(200, newUser, `Welcome back ${user.name}`));
});

export const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;
  await user.updateLastActive();

  // Clear the cookie by setting its maxAge to 0
  const cookieOptions = {
    ...cookieOptions,
    maxAge: 0,
  };
  return res
    .status(200)
    .clearCookie("token", cookieOptions)
    .json(new ApiResponse(200, null, `Goodbye ${user.name}`));
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "enrolledCourses.course",
    select: "title description thumbnail price lessons instructor level",
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await user.updateLastActive();
  const data = {
    ...user.toObject(), // using toObject() to convert Mongoose document to plain JS object
    totalEnrolledCourses: user.totalEnrolledCourses, // using virtual property
  };
  return res
    .status(200)
    .json(new ApiResponse(200, data, "User profile retrieved successfully"));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, bio } = req.body;

  const updatedData = {
    name,
    email: email?.toLowerCase(),
    bio,
  };

  if (req.file) {
    const avatarLocalPath = req.file.path;
    const avatarCloudPath = await uploadOnCloudinary(avatarLocalPath);

    updatedData.avatar = avatarCloudPath.secure_url;

    const user = await User.findById(req.user._id);
    // Delete Old Avatar if there
    if (user.avatar && user.avatar !== "default-avatar.png") {
      await deleteVideoFromCloudinary(user.avatar);
    }
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updatedData, {
    new: true,
    runValidators: true,
  });
  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "User profile updated successfully")
    );
});

export const changeUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!(await user.isPasswordCorrect(currentPassword, user.password))) {
    throw new ApiError(401, "Current password is incorrect");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  await user.updateLastActive();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
});
