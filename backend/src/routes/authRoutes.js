const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController'); // Import controller functions
const router = express.Router(); // Create an Express router instance

// Define authentication routes
router.post('/register', registerUser); // Route for user registration (public)
router.post('/login', loginUser);       // Route for user login (public)

module.exports = router; // Export the router