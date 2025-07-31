const mongoose = require('mongoose');

// Define the schema for the Budget model
const budgetSchema = new mongoose.Schema({
    user: { // Reference to the User who set this budget
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true,
        // Must match categories in Expense model for consistency
        enum: ['Food', 'Rent', 'Travel', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Education', 'Transport', 'Salary', 'Other Income', 'Other Expense'],
    },
    amount: { // Monthly budget amount for this specific category
        type: Number,
        required: true,
        min: 0
    },
    month: { // Stores the month in 'YYYY-MM' format (e.g., '2023-10')
        type: String,
        required: true,
        match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'] // Regex to enforce YYYY-MM format
    },
    createdAt: {
        type: Date,
        default: Date.now // Timestamp for budget creation
    }
});

// Create a unique index to ensure only one budget per user, category, and month
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

// Create and export the Budget model
const Budget = mongoose.model('Budget', budgetSchema);
module.exports = Budget;