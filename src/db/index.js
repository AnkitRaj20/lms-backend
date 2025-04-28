import chalk from "chalk";
import mongoose from "mongoose";
import logger from "../../logger.js";

const MAX_TRIES = 5; // Maximum number of connection attempts
const RETRY_INTERVAL = 5000; // Retry interval in 5ms

class DatabaseConnection {
  constructor() {
    this.returyCount = 0;
    this.isConnected = false;

    // Configure moongoose settings
    mongoose.set("strictQuery", true); // Set strictQuery to true

    // mongoose.set("debug", true); // Enable debug mode for Mongoose queries

    mongoose.connection.on("connected", () => {
      this.isConnected = true;
      logger.info(chalk.green("MongoDB connected successfully!"));
    });
    mongoose.connection.on("error", () => {
      this.isConnected = false;
      logger.info(chalk.green("MongoDB connection error!"));
    });
    mongoose.connection.on("disconnected", () => {
      logger.info(chalk.green("MongoDB Disconnected successfully!"));
      this.handleDisconnection(); // Handle disconnection
    });

    process.on("SIGTERM", this.handleAppTermination.bind(this)); // Handle termination signal
    process.on("SIGINT", this.handleAppTermination.bind(this)); // Handle interrupt signal
  }

  async connect() {
    try {
      if (!process.env.MONGO_URI) {
        logger.error(chalk.red("Mongo URI not found!"));
        return;
      }

      const connectionOptions = {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        maxPoolSize: 10, // Maximum number of sockets in the pool
        minPoolSize: 1, // Minimum number of sockets in the pool
        serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4, // Use IPv4, skip trying IPv6
      };

      if (process.env.NODE_ENV === "development") {
        mongoose.set("debug", true); // Enable debug mode for Mongoose queries
      }

      await mongoose.connect(process.env.MONGO_URI, connectionOptions);
      this.returyCount = 0; // Reset retry count on successful connection
      logger.info(chalk.green("MongoDB connected successfully!"));
    } catch (error) {
      logger.error(chalk.red("MongoDB connection error!", error));
      await this.handleConnectionError(); // Handle connection error
    }
  }

  async handleConnectionError() {
    if (this.returyCount < MAX_TRIES) {
      this.returyCount++;
      logger.error(
        chalk.red(
          `MongoDB connection error! Retrying in ${RETRY_INTERVAL / 1000} seconds...`
        )
      );

      await new Promise((resolve) =>
        setTimeout(() => {
          resolve;
        }, RETRY_INTERVAL)
      ); // Wait for the specified interval before retrying

      return this.connect(); // Attempt to reconnect
    } else {
      logger.error(chalk.red("Max connection attempts reached!"));
      process.exit(1); // Exit the process after max attempts
    }
  }

  async handleDisconnection() {
    if (!this.isConnected) {
      logger.error(chalk.red("MongoDB Disconnected. Attempting to reconnect!"));
      this.connect(); // Attempt to reconnect
    }
  }

  async handleAppTermination() {
    try {
      await mongoose.connection.close(); // Close the connection
      logger.info(chalk.green("MongoDB connection closed!"));
      process.exit(0); // Exit the process
    } catch (error) {
      logger.error(chalk.red("Error closing MongoDB connection!", error));
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      connectionAttempts: this.returyCount,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
}

// Create a singleton instance
const dbConnection = new DatabaseConnection();


export default dbConnection.connect.bind(dbConnection); // Export the connect method for use in other modules
export const getDBStatus = dbConnection.getConnectionStatus.bind(dbConnection); // Export the getConnectionStatus method for use in other modules