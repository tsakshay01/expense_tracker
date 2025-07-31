import React, { useState, useEffect } from 'react';
import api from '../services/api';
import BudgetForm from '../components/BudgetForm'; 
import BudgetList from '../components/BudgetList'; 

const Budgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [budgetSummary, setBudgetSummary] = useState([]); 
    const [editingBudget, setEditingBudget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBudgetsAndSummary();
    }, []);

    const fetchBudgetsAndSummary = async () => {
        setLoading(true);
        setError('');
        try {
            const budgetsRes = await api.get('/budgets'); 
            setBudgets(budgetsRes.data);

            const summaryRes = await api.get('/budgets/summary'); 
            setBudgetSummary(summaryRes.data);

        } catch (err) {
            console.error('Failed to fetch budgets/summary:', err);
            setError('Failed to load budget data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSetOrUpdateBudget = async (budgetData) => {
        try {
            await api.post('/budgets', budgetData); 
            setEditingBudget(null); 
            fetchBudgetsAndSummary(); 
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save budget.');
        }
    };

    const handleEdit = (budget) => {
       
        setEditingBudget(budget);
    };

  

    if (loading) return <div className="loading">Loading budgets...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="budgets-page">
            <h1>Budgets</h1>
            {error && <p className="error-message">{error}</p>}
            <BudgetForm onSubmit={handleSetOrUpdateBudget} initialData={editingBudget} />
            <BudgetList budgets={budgetSummary} onEdit={handleEdit} />
        </div>
    );
};

export default Budgets;