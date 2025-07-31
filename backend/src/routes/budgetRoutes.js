const express = require('express');
const { setBudget, getBudgets, getBudgetSummary } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware'); 
const router = express.Router();

router.route('/') 
    .post(protect, setBudget)  
    .get(protect, getBudgets); 

router.route('/summary') 
    .get(protect, getBudgetSummary); 

module.exports = router;