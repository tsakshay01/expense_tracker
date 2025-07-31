import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ExpenseForm from '../components/ExpenseForm'; 
import ExpenseList from '../components/ExpenseList'; 

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [editingExpense, setEditingExpense] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/expenses');
            setExpenses(response.data);
        } catch (err) {
            console.error('Failed to fetch expenses:', err);
            setError('Failed to load expenses. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrUpdate = async (expenseData) => {
        try {
            if (editingExpense) {
                await api.put(`/expenses/${editingExpense._id}`, expenseData);
                setEditingExpense(null); 
            } else {
                await api.post('/expenses', expenseData);
            }
            fetchExpenses(); 
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save expense.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/expenses/${id}`);
            fetchExpenses(); 
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete expense.');
        }
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense); 
    };

    if (loading) return <div className="loading">Loading expenses...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="expenses-page">
            <h1>Expenses</h1>
            {error && <p className="error-message">{error}</p>}
            <ExpenseForm onSubmit={handleAddOrUpdate} initialData={editingExpense} />
            <ExpenseList expenses={expenses} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
    );
};

export default Expenses;