const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model
const { jwtSecret } = require('../config/jwt'); // Get JWT secret from config

// Middleware function to protect routes (ensure user is authenticated)
const protect = async (req, res, next) => {
    let token;

    // Check if authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token string (e.g., "Bearer TOKEN_STRING" -> "TOKEN_STRING")
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using the secret key
            const decoded = jwt.verify(token, jwtSecret);

            // Find the user by ID from the decoded token and attach user data to the request
            // .select('-password') excludes the password field from the fetched user object
            req.user = await User.findById(decoded.id).select('-password');
            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            console.error(error); // Log the error for debugging
            res.status(401).json({ message: 'Not authorized, token failed or expired' }); // Send 401 Unauthorized
        }
    }

    // If no token was provided in the request headers
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

module.exports = { protect }; // Export the middleware