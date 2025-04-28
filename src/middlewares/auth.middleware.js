import ApiError from "../utils/ApiError.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { cookieOptions } from "../constants/constant.js";

export const createToken = (userId) => {
  console.log(process.env.ACCESS_TOKEN_EXPIRES_IN);
  const token = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });

  return token;
};

export const verifyToken = asyncHandler(async (req, _, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    console.log(decodedToken);

    const user = await User.findById(decodedToken?.userId);

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(403, "Token has expired. Please log in again.");
    }
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token.");
    }
    throw new ApiError(500, "An error occurred while verifying the token.");
  }
});
