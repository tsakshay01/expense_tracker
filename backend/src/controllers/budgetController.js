const Budget = require('../models/Budget'); // Import Budget model
const Expense = require('../models/Expense'); // Import Expense model for summary calculations
const mongoose = require('mongoose');

// Helper function to get the current month in 'YYYY-MM' format
const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero if month < 10
    return `${year}-${month}`;
};

// @desc    Set or update a budget for a category for a specific month
// @route   POST /api/budgets
// @access  Private
const setBudget = async (req, res) => {
    const { category, amount, month } = req.body; // Month can be provided or defaults to current
    const targetMonth = month || getCurrentMonth(); // Use provided month or current month

    // Server-side validation
    if (!category || !amount || isNaN(amount) || parseFloat(amount) < 0) {
        return res.status(400).json({ message: 'Category and a non-negative amount are required.' });
    }
    if (!targetMonth.match(/^\d{4}-\d{2}$/)) { // Validate YYYY-MM format
        return res.status(400).json({ message: 'Invalid month format. Use YYYY-MM.' });
    }

    try {
        // Find and update the budget if it exists for the user, category, and month.
        // If it doesn't exist, create a new one (upsert: true).
        const existingBudget = await Budget.findOneAndUpdate(
            { user: req.user._id, category, month: targetMonth }, // Query to find existing budget
            { amount: parseFloat(amount) }, // Data to update
            { new: true, upsert: true, runValidators: true } // Options: return new doc, create if not found, run schema validators
        );
        res.status(200).json(existingBudget); // Respond with the updated/created budget
    } catch (error) {
        // Handle potential duplicate key error (though upsert should prevent most)
        if (error.code === 11000) {
            return res.status(400).json({ message: `Budget for ${category} in ${targetMonth} already exists.` });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all budgets for the current user and specified month
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
    const month = req.query.month || getCurrentMonth(); // Allow fetching for a specific month via query parameter

    try {
        const budgets = await Budget.find({ user: req.user._id, month }); // Find budgets for user and month
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get budget vs. actual spend summary for the current month by category
// @route   GET /api/budgets/summary
// @access  Private
const getBudgetSummary = async (req, res) => {
    const currentMonth = getCurrentMonth();
    const userId = req.user._id;

    // Calculate start and end dates of the current month for expense aggregation
    const [year, month] = currentMonth.split('-');
    const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1); // Month is 0-indexed in Date constructor
    const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999); // Last day of month, end of day

    try {
        // 1. Fetch all budgets set by the user for the current month
        const budgets = await Budget.find({ user: userId, month: currentMonth });

        // 2. Aggregate actual spending for the current month, grouped by category
        const actualSpending = await Expense.aggregate([
            {
                $match: {
                    user: userId,
                    date: { $gte: startOfMonth, $lte: endOfMonth } // Filter expenses by user and current month
                }
            },
            {
                $group: {
                    _id: '$category', // Group expenses by category
                    totalSpent: { $sum: '$amount' } // Sum the amounts for each category
                }
            }
        ]);

        // Convert actual spending array into a map for quick lookup by category
        const actualSpendingMap = actualSpending.reduce((acc, item) => {
            acc[item._id] = item.totalSpent;
            return acc;
        }, {});

        // 3. Combine budget data with actual spending data to create the summary
        const summary = budgets.map(budget => {
            const actual = actualSpendingMap[budget.category] || 0; // Get spent amount, default to 0 if no expenses
            const remaining = budget.amount - actual;
            // Calculate percentage used, handling division by zero if budget is 0
            const percentageUsed = budget.amount > 0 ? (actual / budget.amount) * 100 : (actual > 0 ? 100 : 0);

            let alertStatus = 'green'; // Default status: within budget
            if (percentageUsed >= 80 && percentageUsed < 100) {
                alertStatus = 'yellow'; // Warning: nearing budget
            } else if (percentageUsed >= 100) {
                alertStatus = 'red'; // Alert: budget exceeded
            }

            return {
                category: budget.category,
                budgeted: budget.amount,
                actualSpend: actual,
                remaining,
                percentageUsed: parseFloat(percentageUsed.toFixed(2)), // Format to 2 decimal places
                alertStatus
            };
        });

        res.json(summary); // Send the combined summary data
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    setBudget,
    getBudgets,
    getBudgetSummary
};