const mongoose = require('mongoose');

// Define the schema for the Expense model
const expenseSchema = new mongoose.Schema({
    user: { // Reference to the User who created this expense
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the 'User' model
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0 // Amount must be non-negative
    },
    category: {
        type: String,
        required: true,
        // Predefined list of categories for consistency
        enum: ['Food', 'Rent', 'Travel', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Education', 'Transport', 'Salary', 'Other Income', 'Other Expense'],
        default: 'Other Expense' // Default category if not specified
    },
    date: {
        type: Date,
        required: true,
        default: Date.now // Default to current date
    },
    notes: {
        type: String,
        trim: true, // Remove leading/trailing whitespace
        maxlength: 200 // Maximum length for notes
    },
    createdAt: {
        type: Date,
        default: Date.now // Timestamp for when the expense record was created
    }
});

// Create and export the Expense model
const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;