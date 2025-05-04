import { PaymentStatus, RoleTypes } from "../constants/constant.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";

export const dashboardData = asyncHandler(async (req, res) => {
  const [totalStudents, totalInstructor, coursePurchases, totalCourses] =
    await Promise.all([
      await User.countDocuments({ role: RoleTypes.STUDENT }),
      await User.countDocuments({ role: RoleTypes.INSTRUCTOR }),

      await CoursePurchase.find({
        status: PaymentStatus.SUCCESS,
      }),
      await CoursePurchase.countDocuments({
        isPublished: true,
      }),
    ]);

  const totalRevenue = coursePurchases.reduce(
    (acc, purchase) => acc + purchase.amount,
    0
  );

  const totalCoursesPurchased = coursePurchases.length;

  return res.status(200).json(
    new ApiResponse(200, {
      totalStudents,
      totalInstructor,
      totalCoursesPurchased,
      totalRevenue,
      totalCourses,
    })
  );
});
