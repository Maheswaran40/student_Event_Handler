
const express = require("express");
const router = express.Router();
const User = require("../models/User");

const {
  loginUser,
  createUserByAdmin,
  registerUser,
  deleteUser,updateUser
// } = require("../controllers/authController");
} = require("../controller/authController");

const { protect, adminOnly } = require("../middleware/authmiddle");
const studentRegister = require("../models/studentRegister");
// Login
router.post("/login", loginUser);
router.post("/registerUser", registerUser);
router.put("/update-user/:id", protect, adminOnly, updateUser);
router.delete("/delete-user/:id", protect, adminOnly, deleteUser);

// get all user
// GET /api/users - Get all users (Admin only)

router.get("/users", protect, async (req, res) => {
  try {
    const users = await User.find()
  .populate({
    path: "eventRoles",
    select: "title date location" // adjust based on your Event schema
  });

    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get("/me", protect, async (req, res) => {
  try {
    // 1. Get user + events only
    const user = await User.findById(req.user._id).populate("eventRoles");

    // 2. Extract event IDs
    const eventIds = user.eventRoles.map(event => event._id);

    // 3. Get only students related to those events
    const students = await studentRegister.find({
      event: { $in: eventIds }
    });

    // 4. Send clean response
res.json({
  success: true,
  data: {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    events: user.eventRoles,
    students: students
  }
});
    console.log("user",user,"eventIds",eventIds,"students",students)

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Admin creates users
router.post("/create-user", protect, adminOnly, createUserByAdmin);

module.exports = router;