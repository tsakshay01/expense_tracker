const Expense = require('../models/Expense'); 
const mongoose = require('mongoose'); 


const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
        res.json(expenses); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const addExpense = async (req, res) => {
    const { amount, category, date, notes } = req.body; 

    
    if (!amount || !category || !date) {
        return res.status(400).json({ message: 'Please enter all required fields: amount, category, and date.' });
    }
    if (isNaN(amount) || parseFloat(amount) <= 0) { 
        return res.status(400).json({ message: 'Amount must be a positive number.' });
    }
    if (new Date(date).toString() === 'Invalid Date') { 
        return res.status(400).json({ message: 'Invalid date format.' });
    }

    try {

        const newExpense = new Expense({
            user: req.user._id, 
            amount: parseFloat(amount), 
            category,
            date: new Date(date), 
            notes,
        });

        const savedExpense = await newExpense.save(); 
        res.status(201).json(savedExpense); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updateExpense = async (req, res) => {
    const { id } = req.params; 
    const { amount, category, date, notes } = req.body; 

    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid expense ID format' });
    }

    
    if (amount !== undefined && (isNaN(amount) || parseFloat(amount) <= 0)) {
        return res.status(400).json({ message: 'Amount must be a positive number.' });
    }
    if (date !== undefined && new Date(date).toString() === 'Invalid Date') {
        return res.status(400).json({ message: 'Invalid date format.' });
    }

    try {
        const expense = await Expense.findById(id); 

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' }); 
        }

        
        if (expense.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to update this expense' }); 
        }


        expense.amount = amount !== undefined ? parseFloat(amount) : expense.amount;
        expense.category = category || expense.category; 
        expense.date = date ? new Date(date) : expense.date;
        expense.notes = notes !== undefined ? notes : expense.notes; 

        const updatedExpense = await expense.save(); 
        res.json(updatedExpense); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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

        
        if (expense.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to delete this expense' });
        }

        await Expense.deleteOne({ _id: id }); 
        res.json({ message: 'Expense removed successfully' }); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getSpendingSummary = async (req, res) => {
    try {
        const userId = req.user._id; 
        const now = new Date();
        
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); 

        
        const totalSpendThisMonthResult = await Expense.aggregate([
            { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } }, 
            { $group: { _id: null, total: { $sum: '$amount' } } } 
        ]);
        const totalSpendThisMonth = totalSpendThisMonthResult.length > 0 ? totalSpendThisMonthResult[0].total : 0;

        
        const spendByCategory = await Expense.aggregate([
            { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } }, 
            { $sort: { total: -1 } } 
        ]);

        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); 
        thirtyDaysAgo.setHours(0, 0, 0, 0); 

        const spendingTrends = await Expense.aggregate([
            { $match: { user: userId, date: { $gte: thirtyDaysAgo } } }, 
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, 
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } } 
        ]);

        const topExpenseDays = await Expense.aggregate([
            { $match: { user: userId, date: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { total: -1 } }, 
            { $limit: 5 } 
        ]);

        
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