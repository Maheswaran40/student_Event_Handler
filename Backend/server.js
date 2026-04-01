const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const studentRoutes = require('./routes/studentroutes');
const eventRoutes = require('./routes/eventroutes');
const activityRoutes = require('./routes/activityRoutes');

// Initialize express app
const app = express();
// cors
const cors=require("cors")
app.use(cors())
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const ConnectDB =require("./config/db")
ConnectDB();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});



// Routes
app.use('/api/students', studentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/activities', activityRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Student Management System API',
    version: '1.0.0',
    endpoints: {
      students: '/api/students',
      events: '/api/events',
      activities: '/api/activities'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});