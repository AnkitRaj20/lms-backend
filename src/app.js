import express from "express";
import cors from "cors";
import helmet from "helmet";
import { globalErrorHandler } from "./utils/error.util.js";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import healthRouter from "./routes/health.route.js";
import hpp from "hpp";
import router from "./routes/index.js";
const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: "Too many requests from this IP, please try again after sometime.",
});

// Apply the rate limiting middleware to all requests.
app.use("/api", limiter);

// CORS Configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "device-remember-token",
      "Access-Control-Allow-Origin",
      "Origin",
      "Accept",
    ],
  })
);
app.use(helmet()); // Sets extra security to headers
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(cookieParser);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// API routes
app.get("/health", healthRouter);
app.use("/api/v1", router);

// Error handling middleware
app.use(globalErrorHandler);

export { app };
