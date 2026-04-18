const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('[SYSTEM_WARN] MONGODB_URI is not defined in .env. Database functionality will be limited.');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[SYSTEM_CORE] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[SYSTEM_ERROR] Database connection failed: ${error.message}`);
    console.error(`[DIAGNOSTIC] Ensure your current IP is whitelisted in MongoDB Atlas: https://cloud.mongodb.com/ v0.0.0.0/0 recommended for development.`);
    // REMOVED: process.exit(1) - to allow UI to load during connectivity issues
  }
};

module.exports = connectDB;
