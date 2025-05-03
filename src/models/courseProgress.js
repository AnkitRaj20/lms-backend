import mongoose, { Schema } from "mongoose";

const lectureProgressSchema = new Schema({
  lecture: {
    type: Schema.Types.ObjectId,
    ref: "Lecture",
    required: [true, "Lecture refrence is required"],
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  watchTime: {
    type: Number,
    default: 0,
  },
  lastWatchedAt: {
    type: Date,
    default: Date.now,
  },
});

const courseProgressSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User refrence is required"],
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course refrence is required"],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lecturesProgress: [lectureProgressSchema],
    lastAccessedAt: {
      type: Date,
      default: Date.now,
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

// Update last accessed

courseProgressSchema.methods.updateLastAccessed = async function () {
  this.lastAccessedAt = Date.now();
  await this.save({ validateBeforeSave: false });
};

// Calculate completion percentage
courseProgressSchema.pre("save", function (next) {
  if (this.lecturesProgress.length > 0) {
    const completedLecture = this.lecturesProgress.filter(
      (lecture) => lecture.isCompleted
    ).length;
    const totalLecture = this.lecturesProgress.length;
    this.completionPercentage = (completedLecture / totalLecture) * 100;
    this.isCompleted = this.completionPercentage === 100 ? true : false;
  }

  next();
});

export const CourseProgress = mongoose.model(
  "CourseProgress",
  courseProgressSchema
);
