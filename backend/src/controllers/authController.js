const User = require('../models/User'); // Import the User model
const jwt = require('jsonwebtoken'); // For JWT operations
const { jwtSecret, jwtExpiresIn } = require('../config/jwt'); // Get JWT config

// Helper function to generate a JWT token for a given user ID
const generateToken = (id) => {
    return jwt.sign({ id }, jwtSecret, {
        expiresIn: jwtExpiresIn, // Token expiration time
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (no authentication needed to register)
const registerUser = async (req, res) => {
    const { username, email, password } = req.body; // Extract data from request body

    console.log('Register attempt:', { username, email, password: '[HIDDEN]' }); // Log incoming data

    // Basic validation for required fields
    if (!username || !email || !password) {
        console.error('Registration Error: Missing fields');
        return res.status(400).json({ message: 'Please enter all fields: username, email, and password.' });
    }

    try {
        let user = await User.findOne({ email }); // Check if a user with this email already exists
        if (user) {
            console.error('Registration Error: User with this email already exists');
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create a new user in the database
        const newUser = new User({
            username,
            email,
            password, // Password will be hashed automatically by the pre-save hook in User model
        });

        console.log('Attempting to save new user...');
        user = await newUser.save(); // Save the new user to the database

        if (user) {
            console.log('User registered successfully:', user.email);
            // If user created successfully, send back user data and a new JWT token
            res.status(201).json({ // 201 Created status
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id), // Generate token for the new user
            });
        } else {
            console.error('Registration Error: Invalid user data provided after save attempt');
            res.status(400).json({ message: 'Invalid user data provided' });
        }
    } catch (error) {
        console.error('Registration Error (Caught in try-catch):', error.message);
        // Log the full error object for more details
        console.error('Full Error Object:', error);

        // Handle specific MongoDB duplicate key error (e.g., if username is also unique)
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username or Email already taken.' });
        }
        res.status(500).json({ message: 'Server error during registration. Please check server logs for details.' }); // Generic server error
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    console.log('Login attempt for:', email); // Log login attempt

    // Basic validation
    if (!email || !password) {
        console.error('Login Error: Missing fields');
        return res.status(400).json({ message: 'Please enter email and password.' });
    }

    try {
        const user = await User.findOne({ email }); // Find user by email

        // Check if user exists AND if the provided password matches the stored hashed password
        if (user && (await user.matchPassword(password))) {
            console.log('User logged in successfully:', user.email);
            // If authentication successful, send back user data and a new JWT token
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            console.error('Login Error: Invalid email or password for', email);
            res.status(401).json({ message: 'Invalid email or password' }); // 401 Unauthorized
        }
    } catch (error) {
        console.error('Login Error (Caught in try-catch):', error.message);
        console.error('Full Error Object:', error);
        res.status(500).json({ message: 'Server error during login. Please check server logs for details.' });
    }
};

module.exports = { registerUser, loginUser }; // Export both controller functions