
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {
  loginUser,
  createUserByAdmin,
  registerUser
// } = require("../controllers/authController");
} = require("../controller/authController");

const { protect, adminOnly } = require("../middleware/authmiddle");
const studentRegister = require("../models/studentRegister");
// Login
router.post("/login", loginUser);
router.post("/registerUser", registerUser);
router.get("/me", protect, async (req, res) => {
  try {
    // 1. Get user + events only
    const user = await User.findById(req.user._id).populate("events");

    // 2. Extract event IDs
    const eventIds = user.events.map(event => event._id);

    // 3. Get only students related to those events
    const students = await studentRegister.find({
      event: { $in: eventIds }
    });

    // 4. Send clean response
    res.json({
      success: true,
      data: {
        role: user.role,
        events: user.events,
        students: students
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Admin creates users
router.post("/create-user", protect, adminOnly, createUserByAdmin);

module.exports = router;