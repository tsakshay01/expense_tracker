const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

// Define the schema for the User model
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Ensures usernames are unique
        trim: true, // Removes whitespace from start/end
        minlength: 3 // Minimum length for username
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensures emails are unique
        trim: true,
        lowercase: true, // Stores email in lowercase
        match: [/.+@.+\..+/, 'Please fill a valid email address'] // Basic email format validation
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Minimum length for password
    },
    createdAt: {
        type: Date,
        default: Date.now // Timestamp for user creation
    }
});

// Mongoose pre-save hook: Hash the password before saving a new user or updating password
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10); // Generate a salt (random string)
    this.password = await bcrypt.hash(this.password, salt); // Hash the password with the salt
    next(); // Continue with the save operation
});

// Method to compare an entered password with the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;