const Expense = require('../models/Expense'); // Import the Expense model
const mongoose = require('mongoose'); // For Mongoose utility functions (like isValidObjectId)

// @desc    Get all expenses for the authenticated user
// @route   GET /api/expenses
// @access  Private (requires JWT authentication)
const getExpenses = async (req, res) => {
    try {
        // Find all expenses where the 'user' field matches the authenticated user's ID
        // Sort them by date in descending order (newest first)
        const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
        res.json(expenses); // Send the expenses as a JSON response
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
    const { amount, category, date, notes } = req.body; // Extract expense data from request body

    // Server-side validation for required fields and data types
    if (!amount || !category || !date) {
        return res.status(400).json({ message: 'Please enter all required fields: amount, category, and date.' });
    }
    if (isNaN(amount) || parseFloat(amount) <= 0) { // Check if amount is a positive number
        return res.status(400).json({ message: 'Amount must be a positive number.' });
    }
    if (new Date(date).toString() === 'Invalid Date') { // Check for valid date format
        return res.status(400).json({ message: 'Invalid date format.' });
    }

    try {
        // Create a new Expense document
        const newExpense = new Expense({
            user: req.user._id, // Assign the authenticated user's ID to the expense
            amount: parseFloat(amount), // Convert amount to a float number
            category,
            date: new Date(date), // Convert date string to a Date object
            notes,
        });

        const savedExpense = await newExpense.save(); // Save the new expense to the database
        res.status(201).json(savedExpense); // Respond with the created expense and 201 Created status
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an existing expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
    const { id } = req.params; // Get the expense ID from the URL parameter
    const { amount, category, date, notes } = req.body; // Get updated data from request body

    // Validate if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid expense ID format' });
    }

    // Basic validation for updated fields (only if they are provided)
    if (amount !== undefined && (isNaN(amount) || parseFloat(amount) <= 0)) {
        return res.status(400).json({ message: 'Amount must be a positive number.' });
    }
    if (date !== undefined && new Date(date).toString() === 'Invalid Date') {
        return res.status(400).json({ message: 'Invalid date format.' });
    }

    try {
        const expense = await Expense.findById(id); // Find the expense by its ID

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' }); // 404 Not Found
        }

        // IMPORTANT SECURITY CHECK: Ensure the authenticated user owns this expense
        if (expense.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to update this expense' }); // 403 Forbidden
        }

        // Update the expense fields if new values are provided in the request
        expense.amount = amount !== undefined ? parseFloat(amount) : expense.amount;
        expense.category = category || expense.category; // Use new category or keep old if not provided
        expense.date = date ? new Date(date) : expense.date;
        expense.notes = notes !== undefined ? notes : expense.notes; // Allow notes to be explicitly cleared (if notes is an empty string)

        const updatedExpense = await expense.save(); // Save the updated expense
        res.json(updatedExpense); // Respond with the updated expense
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid expense ID format' });
    }

    try {
        const expense = await Expense.findById(id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // IMPORTANT SECURITY CHECK: Ensure the authenticated user owns this expense
        if (expense.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to delete this expense' });
        }

        await Expense.deleteOne({ _id: id }); // Delete the expense document
        res.json({ message: 'Expense removed successfully' }); // Confirmation message
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get spending trends and summary data for the dashboard
// @route   GET /api/expenses/summary
// @access  Private
const getSpendingSummary = async (req, res) => {
    try {
        const userId = req.user._id; // Get authenticated user's ID
        const now = new Date();
        // Calculate start and end of the current month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // Last millisecond of current month

        // 1. Calculate Total spending for the current month
        const totalSpendThisMonthResult = await Expense.aggregate([
            { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } }, // Filter by user and current month
            { $group: { _id: null, total: { $sum: '$amount' } } } // Group all matching documents and sum their amounts
        ]);
        const totalSpendThisMonth = totalSpendThisMonthResult.length > 0 ? totalSpendThisMonthResult[0].total : 0;

        // 2. Calculate Spending by Category for the current month (for Pie/Bar Chart)
        const spendByCategory = await Expense.aggregate([
            { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } }, // Group by category and sum amounts
            { $sort: { total: -1 } } // Sort categories by total spending (highest first)
        ]);

        // 3. Calculate Spending trends over time (e.g., daily for the last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); // Go back 30 days
        thirtyDaysAgo.setHours(0, 0, 0, 0); // Set to start of that day

        const spendingTrends = await Expense.aggregate([
            { $match: { user: userId, date: { $gte: thirtyDaysAgo } } }, // Filter by user and last 30 days
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, // Group by date (YYYY-MM-DD)
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } } // Sort by date ascending
        ]);

        // 4. Identify Top Expense Days (e.g., top 5 spending days in the last 30 days)
        const topExpenseDays = await Expense.aggregate([
            { $match: { user: userId, date: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { total: -1 } }, // Sort by total amount descending
            { $limit: 5 } // Get only the top 5 days
        ]);

        // Send all summary data in a single response
        res.json({
            totalSpendThisMonth,
            spendByCategory,
            spendingTrends,
            topExpenseDays
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getSpendingSummary
};