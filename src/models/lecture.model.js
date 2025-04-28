import mongoose, { Schema } from "mongoose";

const lectureSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter a lecture title"],
      maxLength: [100, "Lecture title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please enter a lecture description"],
      maxLength: [500, "Lecture description cannot exceed 500 characters"],
    },
    videoUrl: {
      type: String,
      required: [true, "Please upload a video"],
    },
    duration: {
      type: Number,
      default: 0,
    },
    publicId: {
      type: String,
      required: [true, "Please enter a public ID for video management"],
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      required: [true, "Lecture order is required"],
    },
    //   course: {
    //     type: Schema.Types.ObjectId,
    //     ref: "Course",
    //     required: true,
    //   },
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

lectureSchema.pre("save", function (next) {
  if (this.duration) {
    this.duration = Math.round(this.duration * 100) / 100; // Convert duration to minutes
  }
  next();
});


export const Lecture = mongoose.model("Lecture", lectureSchema);