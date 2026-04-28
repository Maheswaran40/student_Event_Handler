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

//  ADMIN CREATES USER

const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, role, eventId } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Prepare eventRoles array if eventId is provided
    let eventRoles = [];
    if (eventId) {
      eventRoles = [eventId];  // ✅ Just store the event ID directly
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: role || "volunteer",
      eventRoles: eventRoles  // ✅ Array of event IDs
    });

    // Populate the event details in response
    const populatedUser = await User.findById(user._id).populate('eventRoles');

    res.status(201).json({
      success: true,
      data: populatedUser,
    });

  } catch (error) {
    console.error("Create user error:", error);
    res.status(400).json({ error: error.message });
  }
};

// Update user function (simplified)
const updateUser = async (req, res) => {
  try {
    const { name, email, eventId } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;

    // ✅ Update eventRoles - add new event ID to array
    if (eventId) {
      if (!user.eventRoles.includes(eventId)) {
        user.eventRoles.push(eventId);
      }
    }

    await user.save();

    // Populate events
    const populatedUser = await User.findById(user._id).populate('eventRoles');

    res.json({ success: true, data: populatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove event from volunteer
const deleteUser = async (req, res) => {
  try {
    const { userId, eventId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.eventRoles = user.eventRoles.filter(
      id => id.toString() !== eventId
    );

    await user.save();

    res.json({ 
      success: true, 
      message: "Event removed from volunteer",
      data: user 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  loginUser,
  createUserByAdmin,
  registerUser,
  getMe,
  deleteUser,
  updateUser
};