import mongoose, { Schema } from "mongoose";
import { PaymentStatus } from "../constants/constant";

const coursePurchaseSchema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course refrence is required"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User refrence is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      uppercase: true,
      default: "INR",
    },
    status: {
      type: String,
      enum: {
        values: [
          PaymentStatus.PENDING,
          PaymentStatus.SUCCESS,
          PaymentStatus.FAILED,
          PaymentStatus.REFUNDED,
        ],
        message: "Status can only be pending, success, failed or refunded",
      },
      default: PaymentStatus.PENDING,
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
    },
    paymentId: {
      type: String,
      required: [true, "Payment ID is required"],
    },
    refundId: {
      type: String,
    },
    refundAmount: {
      type: Number,
      min: [0, "Refund amount cannot be negative"],
    },
    refundReason: {
      type: String,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

coursePurchaseSchema.index({ course: 1, user: 1 });
coursePurchaseSchema.index({ status: 1 });
coursePurchaseSchema.index({ createdAt: -1 });

coursePurchaseSchema.virtual("isRefunded").get(function () {
  if (this.status !== PaymentStatus.SUCCESS) {
    return false;
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.createdAt > thirtyDaysAgo;
});

coursePurchaseSchema.methods.processRefund = async function refund(
  reason,
  amount
) {
  this.status = PaymentStatus.REFUNDED;
  this.refundAmount = amount || this.amount;
  this.reason = reason;

  return this.save({validateBeforeSave: false});
};

export const CoursePurchase = mongoose.model(
  "CoursePurchase",
  coursePurchaseSchema
);
