import { Course } from "../models/course.model.js";
import { CourseProgress } from "../models/courseProgress.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";

import ApiError from "../utils/ApiError.util.js";

export const getUserCourseProgress = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (!courseId) {
    throw new ApiError(404, "courseId not found");
  }

  // Get course details with lectures
  const courses = await Course.findById(courseId)
    .populate("lectures")
    .select("title description");

  if (!courses) {
    throw new ApiError(404, "Course not found");
  }

  // Get user's progress for the course
  const courseProgress = await CourseProgress.findOne({
    course: courseId,
    user: req.id,
  }).populate("course");

  // If no progress found, return course details with empty progress
  if (!courseProgress) {
    return res.status(200).json(
      new ApiResponse(200, {
        courses,
        progress: [],
        isCompleted: false,
        completionPercentage: 0,
      })
    );
  }

  // Calculate completion percentage
  const totalLectures = courseDetails.lectures.length;
  const completedLectures = courseProgress.lecturesProgress.filter(
    (lp) => lp.isCompleted
  ).length;
  const completionPercentage = Math.round(
    (completedLectures / totalLectures) * 100
  );

  res.status(200).json(
    new ApiResponse(200, {
      courseDetails,
      progress: courseProgress.lecturesProgress,
      isCompleted: courseProgress.isCompleted,
      completionPercentage,
    })
  );
});

export const updateLectureProgress = asyncHandler(async (req, res) => {
  const { courseId, lectureId } = req.params;

  const userId = req.user._id.toString();

  let courseProgress = await CourseProgress.findOne({
    course: courseId,
    user: userId,
  });
  //   If no progress found, create a new one
  if (!courseProgress) {
    courseProgress = await CourseProgress.create({
      user: userId,
      course: courseId,
      isCompleted: false,
      lectureProgress: [],
    });
  }

  const lectureIndex = courseProgress.lecturesProgress.findIndex(
    (lecture) => lecture.lecture === lectureId
  );

  if (lectureIndex === -1) {
    courseProgress.lecturesProgress.push({
      lecture: lectureId,
      isCompleted: true,
    });
  } else {
    courseProgress.lecturesProgress[lectureIndex].isCompleted = true;
  }

  //   Check if the course is completed
  const course = await Course.findById(courseId);

  const completedLectures = courseProgress.lecturesProgress.filter(
    (lp) => lp.isCompleted
  ).length;

  const totalLectures = course.lectures.length;

  courseProgress.isCompleted = totalLectures === completedLectures;

  await courseProgress.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        lectureProgress: courseProgress.lecturesProgress,
        isCompleted: courseProgress.isCompleted,
      },
      "Lecture progress updated successfully"
    )
  );
});

export const markCourseAsCompleted = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const courseProgress = await CourseProgress.findOne({
    course: courseId,
    user: req.user._id,
  });

  if (!courseProgress) {
    throw new ApiError("Course progress not found", 404);
  }

  // Mark all lectures as isCompleted
  courseProgress.lecturesProgress.forEach((progress) => {
    progress.isCompleted = true;
  });

  courseProgress.isCompleted = true;

  courseProgress.completionPercentage = 100;

  await courseProgress.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, courseProgress, "All lectures marked as completed")
    );
});

export const resetCourseProgress = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const courseProgress = await CourseProgress.findOne({
    course: courseId,
    user: req.user._id,
  });

  if (!courseProgress) {
    throw new ApiError("Course progress not found", 404);
  }

  // Reset all lectures to not completed
  courseProgress.lecturesProgress.forEach((progress) => {
    progress.isCompleted = false;
  });

  courseProgress.isCompleted = false;
  courseProgress.completionPercentage = 0;

  await courseProgress.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, courseProgress, "Course progress reset successfully")
    );
});
