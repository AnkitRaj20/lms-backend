import mongoose, { Schema } from "mongoose";
import { LevelTypes } from "../constants/constant.js";

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter a course title"],
      maxLength: [100, "Course title cannot exceed 100 characters"],
    },
    subtitle: {
      type: String,
      maxLength: [200, "Course subtitle cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Please enter a course description"],
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: [true, "Please enter a course category"],
    },
    price: {
      type: Number,
      required: [true, "Please enter a course price"],
      min: [0, "Price cannot be negative"],
    },
    level: {
      type: String,
      enum: {
        values: [
          LevelTypes.BEGINNER,
          LevelTypes.INTERMEDIATE,
          LevelTypes.ADVANCED,
        ],
        message: "Please select a valid level",
      },
      default: LevelTypes.BEGINNER,
    },
    thumbnail: {
      type: String,
      required: [true, "Please upload a course thumbnail"],
    },
    enrolledStudents: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lectures: [
      {
        type: Schema.Types.ObjectId,
        ref: "Lecture",
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    totalDuration: {
      type: Number,
      default: 0,
    },
    ratings: {
      type: [
        {
          rating: { type: Number, min: 1, max: 5, required: true },
          ratedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        },
      ],
      default: [], // ✅ Initializes as empty array
    },
    totalLectures: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.ratings;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.ratings;
        return ret;
      },
    },
  }
);

courseSchema.virtual("averageRating").get(function () {
  // Calculate the average rating of the course
  if (!this.ratings?.length) return 0;
  const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
  return (sum / this.ratings.length).toFixed(1);
});

courseSchema.pre("save", function (next) {
  if (this.lectures) {
    this.totalLectures = this.lectures.length;
  }

  next();
});

export const Course = mongoose.model("Course", courseSchema);
