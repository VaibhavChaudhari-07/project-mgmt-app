const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    console.log("Connection URI:", process.env.MONGO_URI.substring(0, 50) + "...");
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("Make sure:");
    console.error("  1. MongoDB Atlas cluster is RUNNING (not paused)");
    console.error("  2. Your IP is whitelisted in MongoDB Atlas");
    console.error("  3. Database credentials are correct");
    console.error("  4. Network connection is stable");
    
    // Exit with delay to allow reading error
    setTimeout(() => process.exit(1), 2000);
  }
};

module.exports = connectDB;
