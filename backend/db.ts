import mongoose from "mongoose";

const MAX_RETRIES = 5;

export const connectDB = async (attempt = 1): Promise<void> => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set in .env");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error(`❌ MongoDB connection attempt ${attempt} failed:`, err);

    if (attempt >= MAX_RETRIES) {
      throw new Error("MongoDB connection failed after max retries.");
    }

    const delay = Math.pow(2, attempt - 1) * 1000;

    console.log(
      `⏳ Retrying in ${delay / 1000}s... (attempt ${attempt + 1}/${MAX_RETRIES})`
    );

    await new Promise((resolve) => setTimeout(resolve, delay));

    return connectDB(attempt + 1);
  }
};