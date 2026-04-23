// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "volunteer"],
    default: "volunteer",
  },
  events: [{  // Array of event IDs that this volunteer manages
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event"
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);