export const UserStatus = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
});

export const cookieOptions = Object.freeze({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000, // 1 Day
});

export const RoleTypes = Object.freeze({
  ADMIN: "admin",
  STUDENT: "student",
  INSTRUCTOR: "instructor",
});

export const LevelTypes = Object.freeze({
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
});

export const PaymentStatus = Object.freeze({
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  REFUNDED: "refunded",
});
