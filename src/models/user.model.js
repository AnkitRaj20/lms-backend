import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { RoleTypes, UserStatus } from "../constants/constant.js";
import crypto from "crypto";
import { Course } from "./course.model.js"; // Adjust path as needed

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter a name"],
      maxLength: [50, "Name cannot exceed 50 characters"],
      minLength: [2, "Name should have more than 2 characters"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please enter an email"],
      unique: true,
      trim: true,
      lowercase: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
      minLength: [6, "Password should have more than 6 characters"],
      select: false, // Do not return password in queries by default
    },
    role: {
      type: String,
      enum: {
        values: [RoleTypes.ADMIN, RoleTypes.STUDENT, RoleTypes.INSTRUCTOR],
        message: "Please select a valid role",
      },
      default: RoleTypes.STUDENT,
    },
    avatar: {
      type: String,
      default: "default-avatar.png",
    },
    bio: {
      type: String,
      maxLength: [200, "Bio cannot exceed 200 characters"],
    },
    enrolledCourses: [
      {
        course: {
          type: Schema.Types.ObjectId,
          ref: "Course",
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdCourses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    status: {
      type: String,
      enum: [UserStatus.ACTIVE, UserStatus.INACTIVE],
      default: "active",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastActive: {
      type: Date,
      default: Date.now,
    },
  
  },
  {
    timestamps: true, // Automatically create createdAt and updatedAt fields
    toJSON: { virtuals: true }, // For converting the document to JSON format(using for virtuals)
    toObject: { virtuals: true }, // For converting the document to Object format(using for virtuals)
  }
);

userSchema.index({ register_at: 1 });

// Runs before saving the user to the database
// pre is a hook
userSchema.pre("save", async function (next) {
  // If password is modified then run this code
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Check if the password is correct or not
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.getResetPasswordToken = async function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

userSchema.methods.updateLastActive = function () {
  this.lastActive = Date.now();
  return this.save({ validateBeforeSave: false });
};

//* virtuals are not stored in the database, but they can be used to calculate values based on other fields in the schema
userSchema.virtual("totalEnrolledCourses").get(function () {
  return this.enrolledCourses.length;
});

export const User = mongoose.model("User", userSchema);
