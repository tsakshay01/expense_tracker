const mongoose = require('mongoose');


const budgetSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true,
        
        enum: ['Food', 'Rent', 'Travel', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Education', 'Transport', 'Salary', 'Other Income', 'Other Expense'],
    },
    amount: { 
        type: Number,
        required: true,
        min: 0
    },
    month: { 
        type: String,
        required: true,
        match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'] 
    },
    createdAt: {
        type: Date,
        default: Date.now 
    }
});


budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);
module.exports = Budget;