import mongoose from "mongoose";

export default async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ ERROR: MONGODB_URI is not set in Render Environment Variables.");
    throw new Error("MONGODB_URI is not configured.");
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log("✅ MongoDB Atlas connected successfully.");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error(
      "💡 Tip: If using MongoDB Atlas, check that 'Network Access' has IP 0.0.0.0/0 (Allow Access From Anywhere) enabled in MongoDB Atlas dashboard."
    );
    throw err;
  }
}
