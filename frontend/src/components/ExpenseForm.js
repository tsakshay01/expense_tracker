import React, { useState, useEffect } from 'react';
import { format } from 'date-fns'; 

const ExpenseForm = ({ onSubmit, initialData }) => {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Other Expense'); 
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd')); 
    const [notes, setNotes] = useState('');

    const categories = [
        'Food', 'Rent', 'Travel', 'Entertainment', 'Shopping', 'Utilities',
        'Healthcare', 'Education', 'Transport', 'Salary', 'Other Income', 'Other Expense'
    ];

    
    useEffect(() => {
        if (initialData) {
            setAmount(initialData.amount);
            setCategory(initialData.category);
            setDate(format(new Date(initialData.date), 'yyyy-MM-dd'));
            setNotes(initialData.notes || '');
        } else {
            
            setAmount('');
            setCategory('Other Expense');
            setDate(format(new Date(), 'yyyy-MM-dd'));
            setNotes('');
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ amount, category, date, notes });
        
        if (!initialData) {
            setAmount('');
            setCategory('Other Expense');
            setDate(format(new Date(), 'yyyy-MM-dd'));
            setNotes('');
        }
    };

    return (
        <div className="form-card">
            <h3>{initialData ? 'Edit Expense' : 'Add New Expense'}</h3>
            <form onSubmit={handleSubmit} className="expense-form">
                <div className="form-group">
                    <label htmlFor="amount">Amount:</label>
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
                    <label htmlFor="date">Date:</label>
                    <input
                        type="date"
                        id="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="notes">Notes (Optional):</label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="2"
                        maxLength="200"
                    ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                    {initialData ? 'Update Expense' : 'Add Expense'}
                </button>
            </form>
        </div>
    );
};

export default ExpenseForm;