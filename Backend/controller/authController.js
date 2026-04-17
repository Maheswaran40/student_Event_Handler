const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "30d",
  });
};

// ✅ LOGIN ONLY
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    console.log("user" , user.password,password)
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password 1st",
      });
    }
    console.log(await bcrypt.hash(password,10)) 
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("isMatch",isMatch)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password 2nd",
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// ✅ ADMIN CREATES USER
const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      success: true,
      message: "User created by admin",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User exists" });
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: role || "admin", // 👈 make first user admin
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  loginUser,
  createUserByAdmin,
  registerUser
};