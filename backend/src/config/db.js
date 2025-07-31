const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env

// Function to connect to MongoDB database
const connectDB = async () => {
    try {
        // Mongoose connects using the MONGO_URI from your .env file
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...'); // Success message
    } catch (err) {
        console.error(err.message); // Log error message
        process.exit(1); // Exit the process if connection fails
    }
};

module.exports = connectDB; // Export the connection function