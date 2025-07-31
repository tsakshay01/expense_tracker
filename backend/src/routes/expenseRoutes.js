const express = require('express');
const { getExpenses, addExpense, updateExpense, deleteExpense, getSpendingSummary } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware'); // Import the authentication middleware
const router = express.Router();

// Routes for managing individual expenses
router.route('/') // Applies to /api/expenses
    .get(protect, getExpenses) // GET: Get all expenses for authenticated user
    .post(protect, addExpense); // POST: Add a new expense for authenticated user

router.route('/summary') // Applies to /api/expenses/summary
    .get(protect, getSpendingSummary); // GET: Get spending analytics for dashboard

router.route('/:id') // Applies to /api/expenses/:id (where :id is the expense ID)
    .put(protect, updateExpense) // PUT: Update a specific expense
    .delete(protect, deleteExpense); // DELETE: Delete a specific expense

module.exports = router;