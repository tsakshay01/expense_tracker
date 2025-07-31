import React from 'react';

const BudgetList = ({ budgets, onEdit }) => {
    if (!budgets || budgets.length === 0) {
        return <div className="no-data">No budgets set for this month.</div>;
    }

    return (
        <div className="budget-list-container">
            <h3>Your Monthly Budgets</h3>
            <ul className="budget-list">
                {budgets.map((budget) => (
                    <li key={budget.category} className={`budget-item card status-${budget.alertStatus}`}>
                        <div className="budget-details">
                            <span className="budget-category">{budget.category}</span>
                            <div className="budget-amounts">
                                <p>Budgeted: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(budget.budgeted)}</p>
                                <p>Spent: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(budget.actualSpend)}</p>
                                <p>Remaining: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(budget.remaining)}</p>
                            </div>
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar"
                                    style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }} // Cap at 100% for bar width
                                ></div>
                                <span className="progress-text">{budget.percentageUsed}%</span>
                            </div>
                        </div>
                        <div className="budget-actions">
                            <button onClick={() => onEdit(budget)} className="btn btn-secondary">Edit</button>
                            {/* No delete button for simplicity as setBudget acts as upsert/update */}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BudgetList;