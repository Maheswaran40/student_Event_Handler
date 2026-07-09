const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB connected successfully");
  } catch (err) {
    console.log("DB not connected:", err.message);
  }
};

module.exports = connectDB;