import mongoose from "mongoose";
import chalk from "chalk";
import path, { dirname } from "path";
import fs from "fs"
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * ! Global error handler for Mongoose/MongoDB
 */
export const globalErrorHandler = (error, req, res, next) => {
  const errorDetails = `
  Timestamp: ${new Date().toISOString()}
  API ENDPOINT : ${req.originalUrl || req.path}
  Error Name: ${error.name || "Unknown Error"}
  Error Message: ${error.message || "No message provided"}
  Stack Trace: ${error.stack || "No stack trace available"}

  ========================================================
`;
  console.error(
    chalk.red(
      `Error ${error.stack ? `Stack --> ${error.stack} \n` : ``}${
        error.message ? `Message --> ${error.message}` : ``
      }`
    )
  );

  // Create or append to the error.log file
    const logFilePath = path.join(__dirname, "../../error.log");
  
    // Check if the error.log file exists
    fs.appendFile(logFilePath, errorDetails, (err) => {
      if (err) {
        console.error(chalk.red("Error logging to file:", err));
      } else {
        console.log(chalk.green("Error details logged to 'error.log'"));
      }
    });
  

  // Mongoose validation error
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      status: false,
      message: "Validation Error",
      errors: Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      })),
    });
  }

  // Duplicate key error (e.g., unique email constraint)
  if (error.code === 11000) {
    return res.status(409).json({
      status: false,
      message: "Duplicate key error",
      errors: Object.keys(error.keyValue).map((field) => ({
        field,
        message: `${field} already exists.`,
      })),
    });
  }

  // CastError (e.g., invalid ObjectId)
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      status: false,
      message: `Invalid ${error.path}: ${error.value}`,
    });
  }

  // Custom application-level error with statusCode (Updated from httpStatus)
  if (error.statusCode && error.message) {
    return res.status(error.statusCode).json({
      status: false,
      message: error.message,
      errors: error.errors && error.errors.length > 0 ? error.errors : undefined,
    });
  }

  // Fallback for unhandled errors
  return res.status(500).json({
    status: false,
    message: "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
};

