const express = require('express');
const { setBudget, getBudgets, getBudgetSummary } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware'); // Import authentication middleware
const router = express.Router();

// Routes for managing budgets
router.route('/') // Applies to /api/budgets
    .post(protect, setBudget)  // POST: Set or update a budget
    .get(protect, getBudgets); // GET: Get all budgets for a specific month

router.route('/summary') // Applies to /api/budgets/summary
    .get(protect, getBudgetSummary); // GET: Get budget vs. actual spend summary

module.exports = router;