import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const BudgetForm = ({ onSubmit, initialData }) => {
    const [category, setCategory] = useState('Food'); // Default category
    const [amount, setAmount] = useState('');
    const [month, setMonth] = useState(format(new Date(), 'yyyy-MM')); // Default to current month

    const categories = [
        'Food', 'Rent', 'Travel', 'Entertainment', 'Shopping', 'Utilities',
        'Healthcare', 'Education', 'Transport', 'Salary', 'Other Income', 'Other Expense'
    ];

    // Populate form if initialData (for editing) is provided
    useEffect(() => {
        if (initialData) {
            setCategory(initialData.category);
            setAmount(initialData.budgeted); // Note: using 'budgeted' from summary
            // Initial data might not have the 'month' directly, derive it or adjust API if needed.
            // For now, assume it's current month or add 'month' to summary
            // If we get it from raw budgets (not summary), it would be initialData.month
            // Let's assume initialData has month if it's from raw budget list
            // If it's from budgetSummary, we might not have `month` easily.
            // For simplicity, for editing, we assume initialData directly comes from a raw budget object
            // Let's adjust Budgets.js `handleEdit` if needed to pass original budget, not summary item.
            // For now, if initialData doesn't have month, it defaults to current month
            setMonth(initialData.month || format(new Date(), 'yyyy-MM'));
        } else {
            // Reset form for new entry
            setCategory('Food');
            setAmount('');
            setMonth(format(new Date(), 'yyyy-MM'));
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ category, amount: parseFloat(amount), month });
        // Clear form after submission if it's a new entry (or if not editing)
        if (!initialData) {
            setAmount('');
            setCategory('Food');
            setMonth(format(new Date(), 'yyyy-MM'));
        }
    };

    return (
        <div className="form-card">
            <h3>Set Budget</h3>
            <form onSubmit={handleSubmit} className="budget-form">
                <div className="form-group">
                    <label htmlFor="category">Category:</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="amount">Budget Amount:</label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="month">Month:</label>
                    <input
                        type="month" // HTML5 input type for month and year
                        id="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    {initialData ? 'Update Budget' : 'Set Budget'}
                </button>
            </form>
        </div>
    );
};

export default BudgetForm;