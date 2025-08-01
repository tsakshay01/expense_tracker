import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { format } from 'date-fns';
import './Expenses.css';

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

const ExpenseModal = ({ isOpen, onClose, onSave, expense, categories }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (expense) {
            setFormData({ ...expense, date: format(new Date(expense.date), 'yyyy-MM-dd') });
        } else {
            setFormData({ amount: '', category: categories[0] || '', date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
        }
    }, [expense, isOpen, categories]);

    if (!isOpen) return null;

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{expense ? 'Edit Expense' : 'Add New Expense'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label>Amount</label><input type="number" name="amount" value={formData.amount} onChange={handleChange} required /></div>
                    <div className="form-group"><label>Category</label><select name="category" value={formData.category} onChange={handleChange} required>{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                    <div className="form-group"><label>Date</label><input type="date" name="date" value={formData.date} onChange={handleChange} required /></div>
                    <div className="form-group"><label>Notes (Optional)</label><textarea name="notes" value={formData.notes} onChange={handleChange}></textarea></div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">Save Expense</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentExpense, setCurrentExpense] = useState(null);
    const [categories] = useState(['Food', 'Rent', 'Travel', 'Entertainment', 'Shopping', 'Utilities',
        'Healthcare', 'Education', 'Transport', 'Salary', 'Other Income', 'Other Expense']);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await api.get('/expenses');
            setExpenses(res.data);
        } catch (err) { console.error("Failed to fetch expenses:", err); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchExpenses(); }, []);

    const handleSave = async (expenseData) => {
        try {
            if (currentExpense) await api.put(`/expenses/${currentExpense._id}`, expenseData);
            else await api.post('/expenses', expenseData);
            fetchExpenses();
            setIsModalOpen(false);
            setCurrentExpense(null);
        } catch (err) { console.error("Failed to save expense:", err); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await api.delete(`/expenses/${id}`);
                fetchExpenses();
            } catch (err) { console.error("Failed to delete expense:", err); }
        }
    };
    
    return (
        <div className="expenses-page">
            <header className="page-header">
                <h1>Manage Expenses</h1>
                <button className="btn-primary" onClick={() => { setCurrentExpense(null); setIsModalOpen(true); }}>+ Add Expense</button>
            </header>

            {loading ? <p>Loading...</p> : (
                <div className="table-container">
                    <table>
                        <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Notes</th><th>Actions</th></tr></thead>
                        <tbody>
                            {expenses.map(exp => (
                                <tr key={exp._id}>
                                    <td>{format(new Date(exp.date), 'MMM dd, yyyy')}</td>
                                    <td>{exp.category}</td>
                                    <td>{formatCurrency(exp.amount)}</td>
                                    <td>{exp.notes}</td>
                                    <td className="actions-cell">
                                        <button className="btn-icon" onClick={() => { setCurrentExpense(exp); setIsModalOpen(true); }}>Edit</button>
                                        <button className="btn-icon btn-danger" onClick={() => handleDelete(exp._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} expense={currentExpense} categories={categories} />
        </div>
    );
};

export default Expenses;
