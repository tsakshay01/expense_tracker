const Budget = require('../models/Budget'); 
const Expense = require('../models/Expense');
const mongoose = require('mongoose');


const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); 
    return `${year}-${month}`;
};

const setBudget = async (req, res) => {
    const { category, amount, month } = req.body; 
    const targetMonth = month || getCurrentMonth(); 


    if (!category || !amount || isNaN(amount) || parseFloat(amount) < 0) {
        return res.status(400).json({ message: 'Category and a non-negative amount are required.' });
    }
    if (!targetMonth.match(/^\d{4}-\d{2}$/)) { 
        return res.status(400).json({ message: 'Invalid month format. Use YYYY-MM.' });
    }

    try {
       
        const existingBudget = await Budget.findOneAndUpdate(
            { user: req.user._id, category, month: targetMonth }, 
            { amount: parseFloat(amount) }, 
            { new: true, upsert: true, runValidators: true } 
        );
        res.status(200).json(existingBudget); 
    } catch (error) {
       
        if (error.code === 11000) {
            return res.status(400).json({ message: `Budget for ${category} in ${targetMonth} already exists.` });
        }
        res.status(500).json({ message: error.message });
    }
};


const getBudgets = async (req, res) => {
    const month = req.query.month || getCurrentMonth();

    try {
        const budgets = await Budget.find({ user: req.user._id, month }); 
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getBudgetSummary = async (req, res) => {
    const currentMonth = getCurrentMonth();
    const userId = req.user._id;

   
    const [year, month] = currentMonth.split('-');
    const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1); 
    const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999); 
    try {
        
        const budgets = await Budget.find({ user: userId, month: currentMonth });

        
        const actualSpending = await Expense.aggregate([
            {
                $match: {
                    user: userId,
                    date: { $gte: startOfMonth, $lte: endOfMonth } 
                }
            },
            {
                $group: {
                    _id: '$category', 
                    totalSpent: { $sum: '$amount' } 
                }
            }
        ]);

       
        const actualSpendingMap = actualSpending.reduce((acc, item) => {
            acc[item._id] = item.totalSpent;
            return acc;
        }, {});

       
        const summary = budgets.map(budget => {
            const actual = actualSpendingMap[budget.category] || 0; 
            const remaining = budget.amount - actual;
            
            const percentageUsed = budget.amount > 0 ? (actual / budget.amount) * 100 : (actual > 0 ? 100 : 0);

            let alertStatus = 'green'; 
            if (percentageUsed >= 80 && percentageUsed < 100) {
                alertStatus = 'yellow'; 
            } else if (percentageUsed >= 100) {
                alertStatus = 'red'; 
            }

            return {
                category: budget.category,
                budgeted: budget.amount,
                actualSpend: actual,
                remaining,
                percentageUsed: parseFloat(percentageUsed.toFixed(2)), 
                alertStatus
            };
        });

        res.json(summary); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    setBudget,
    getBudgets,
    getBudgetSummary
};