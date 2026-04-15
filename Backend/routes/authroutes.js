// // routes/authRoutes.js
// const express = require('express');
// const router = express.Router();
// const {
//   registerUser,
//   loginUser,
//   getMe,
//   updateUserRole,
//   getAllUsers
// } = require('../controllers/authController');
// const { protect, adminOnly } = require('../middleware/authMiddleware');

// // Public routes
// router.post('/register', registerUser);
// router.post('/login', loginUser);

// // Private routes
// router.get('/me', protect, getMe);
// router.get('/users', protect, adminOnly, getAllUsers);
// router.put('/role/:id', protect, adminOnly, updateUserRole);


// module.exports = router;

const express = require("express");
const router = express.Router();

const {
  loginUser,
  createUserByAdmin,
  registerUser
// } = require("../controllers/authController");
} = require("../controller/authController");

const { protect, adminOnly } = require("../middleware/authmiddle");
// Login
router.post("/login", loginUser);
router.post("/registerUser", registerUser);

// Admin creates users
router.post("/create-user", protect, adminOnly, createUserByAdmin);

module.exports = router;