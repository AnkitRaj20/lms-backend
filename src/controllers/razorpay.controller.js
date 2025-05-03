import razorpay from "razorpay";
import crypto from "crypto";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import ApiError from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import logger from "../../logger.js";
import { PaymentStatus } from "../constants/constant.js";
import asyncHandler from "../utils/asyncHandler.util.js";

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      throw new ApiError("Course not found");
    }

    const newPurchase = await CoursePurchase.create({
      user: userId,
      course: courseId,
      amount: course.price,
      status: "pending",
      paymentMethod: "razorpay",
    });

    const options = {
      amount: course.price * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: `${newPurchase._id.toString()}_course${courseId}_user${userId}`,
      notes: {
        courseId,
        userId,
      },
    };

    const order = await razorpayInstance.orders.create(options);

    newPurchase.paymentId = order.id;
    await newPurchase.save({ validateBeforeSave: false });

    const response = {
      id: order.id,
      currency: order.currency,
      amount: order.amount / 100,
      status: order.status,
      receipt: order.receipt,
      course: {
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
      },
    };

    return res
      .status(200)
      .json(new ApiResponse(200, "Order created successfully", response));
  } catch (error) {
    logger.error("Error creating Razorpay order", error);
    return res
      .status(500)
      .json(new ApiError(500, "Payment verification failed"));
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      throw new ApiError(400, " Payment Verification Failed");
    }

    const purchase = await CoursePurchase.findOne({
      paymentId: razorpay_order_id,
    });
    if (!purchase) {
      throw new ApiError(404, "Purchase not found");
    }

    purchase.paymentStatus = PaymentStatus.SUCCESS;
    await purchase.save({ validateBeforeSave: false });

    return res.status(200).json(
      new ApiResponse(200, "Payment verified successfully", {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        courseId: purchase.course,
      })
    );
  } catch (error) {
    logger.error("Error verifying Razorpay payment", error);
    return res
      .status(500)
      .json(new ApiError(500, "Payment verification failed"));
  }
};

export const getCoursePurchaseStatus = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // Find course with populated data
  const course = await Course.findById(courseId)
    .populate("instructor", "name avatar")
    .populate("lectures", "lectureTitle videoUrl duration");

  if (!course) {
    throw new ApiError("Course not found", 404);
  }

  // Check if user has purchased the course
  const purchased = await CoursePurchase.exists({
    user: req.user._id,
    course: courseId,
    status: "completed",
  });

  res.status(200).json(
    new ApiResponse(200, {
      course,
      isPurchased: Boolean(purchased),
    })
  );
});

export const getPurchasedCourses = asyncHandler(async (req, res) => {
  const purchases = await CoursePurchase.find({
    userId: req.user._id,
    // status: "completed",
  }).populate({
    path: "courseId",
    select: "courseTitle courseThumbnail courseDescription category",
    populate: {
      path: "instructor",
      select: "name avatar",
    },
  });


  res.status(200).json(
    new ApiResponse(
      200,
      purchases.map((purchase) => purchase.course)
    )
  );
});
