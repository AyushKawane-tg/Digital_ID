const mongoose = require("mongoose");

/**
 * Connects to MongoDB using MONGO_URI.
 * Exits the process if the database is unreachable so the API
 * does not start in a half-working state.
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("MongoDB connection failed: MONGO_URI is missing in .env");
    process.exit(1);
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`MongoDB connected: ${connection.connection.host}/${connection.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.error("Check MONGO_URI in backend/.env (Atlas SRV string or local MongoDB).");
    process.exit(1);
  }
};

module.exports = connectDB;
