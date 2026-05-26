// backend/src/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.DATABASE_URL;
    if (!uri) {
      throw new Error("MONGO_URI or DATABASE_URL is not defined in environment variables.");
    }
    await mongoose.connect(uri);
    console.log('MongoDB Connected Successfully!!');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;  