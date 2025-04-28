import { getDBStatus } from "../db/index.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";

export const healthCheck = asyncHandler(async (req, res) => {
  const dbStatus = getDBStatus();

  const healthStatus = {
    status: "OK",
    timeStamp: new Date().toISOString(),
    services: {
      database: {
        status: dbStatus.isConnected ? "Healthy" : "Unhealthy",
        details: {
          ...dbStatus,
          readyState: getReadyStateText(dbStatus.readyState),
        },
      },
      server: {
        status: "Healthy",
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      },
    },
  };

  const httpStatus =
    healthStatus.services.database.status === "Healthy" ? 200 : 503;
  return res.status(httpStatus).json(new ApiResponse(httpStatus, healthStatus));
});

function getReadyStateText(state) {
  switch (state) {
    case 0:
      return "Disconnected";
    case 1:
      return "Connected";
    case 2:
      return "Connecting";
    case 3:
      return "Disconnecting";
    default:
      return "Unknown";
  }
}
