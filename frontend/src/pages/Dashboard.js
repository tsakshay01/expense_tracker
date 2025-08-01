import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title, PointElement, LineElement } from 'chart.js';
import { format } from 'date-fns';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title, PointElement, LineElement);

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [budgetSummary, setBudgetSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeFrame, setTimeFrame] = useState('monthly');

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError('');
            try {
                const expenseRes = await api.get(`/expenses/summary?period=${timeFrame}`);
                const budgetRes = await api.get(`/budgets/summary?period=${timeFrame}`);
                setSummary(expenseRes.data);
                setBudgetSummary(budgetRes.data);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [timeFrame]);

    const totalBudget = budgetSummary?.reduce((acc, item) => acc + item.budgeted, 0) || 0;
    const totalSpend = timeFrame === 'monthly' ? summary?.totalSpendThisMonth : summary?.totalSpendThisWeek;
    
    const doughnutChartData = {
        labels: summary?.spendByCategory.map(item => item._id) || [],
        datasets: [{
            data: summary?.spendByCategory.map(item => item.total) || [],
            backgroundColor: ['#4F46E5', '#10B981', '#F59E0B', '#6B7280', '#EF4444'],
            borderColor: '#ffffff',
            borderWidth: 4,
        }],
    };
    const doughnutChartOptions = {
        responsive: true, cutout: '70%', plugins: { legend: { display: false } },
    };
    const barChartData = {
        labels: budgetSummary?.map(item => item.category) || [],
        datasets: [
            { label: 'Budget', data: budgetSummary?.map(item => item.budgeted) || [], backgroundColor: '#A5B4FC' },
            { label: 'Spending', data: budgetSummary?.map(item => item.actualSpend) || [], backgroundColor: '#4F46E5' },
        ],
    };
    const barChartOptions = {
        responsive: true, plugins: { legend: { position: 'top', align: 'end' } },
        scales: { x: { stacked: false, grid: { display: false } }, y: { beginAtZero: true, grid: { display: false } } },
    };

    const topSpendingCategories = summary?.spendByCategory
        ?.sort((a, b) => b.total - a.total)
        .slice(0, 3);

    if (loading) return <div className="loading">Loading dashboard...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <h1>Dashboard</h1>
                <div className="header-controls">
                    {/* <select className="header-dropdown"><option>INR</option></select> */}
                    <select
                        className="header-dropdown"
                        value={timeFrame}
                        onChange={(e) => setTimeFrame(e.target.value)}
                    >
                        <option value="monthly">This Month</option>
                        <option value="weekly">This Week</option>
                    </select>
                </div>
            </header>

            <div className="dashboard-grid">
                <div className="chart-container">
                    <h2>Budget vs Spending</h2>
                    <Bar options={barChartOptions} data={barChartData} />

                    <div className="top-categories-list">
                        <h3>Top Spending Categories</h3>
                        <ul>
                            {topSpendingCategories?.map((item) => (
                                <li key={item._id}>
                                    <span className="category-name">{item._id}</span>
                                    <span className="category-amount">{formatCurrency(item.total)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="right-column-stack">
                    <div className="summary-cards">
                        <div className="stat-card blue-bg">
                            <h3>Total {timeFrame === 'monthly' ? 'Monthly' : 'Weekly'} Budget</h3>
                            <p>{formatCurrency(totalBudget)}</p>
                        </div>
                        <div className="stat-card white-bg">
                            <h3>Total {timeFrame === 'monthly' ? 'Monthly' : 'Weekly'} Spend</h3>
                            <p>{formatCurrency(totalSpend || 0)}</p>
                        </div>
                    </div>

                    <div className="chart-container">
                        <h2>Expenses by Category</h2>
                        <div className="doughnut-wrapper">
                           <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                           <div className="doughnut-center-text">
                                <strong>{formatCurrency(totalSpend || 0)}</strong>
                                <span>This {timeFrame === 'monthly' ? 'Month' : 'Week'}</span>
                           </div>
                        </div>
                        <div className="doughnut-legend">
                            {doughnutChartData.labels.map((label, index) => (
                                <div key={label} className="legend-item">
                                    <span className="legend-color" style={{ backgroundColor: doughnutChartData.datasets[0].backgroundColor[index] }}></span>
                                    <span>{label}</span>
                                 </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
