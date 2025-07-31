import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title, PointElement, LineElement } from 'chart.js';
import { format } from 'date-fns';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title, PointElement, LineElement);

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [budgetSummary, setBudgetSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch spending summary
                const expenseRes = await api.get('/expenses/summary');
                setSummary(expenseRes.data);

                // Fetch budget summary
                const budgetRes = await api.get('/budgets/summary');
                setBudgetSummary(budgetRes.data);

            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="loading">Loading dashboard...</div>;
    if (error) return <div className="error-message">{error}</div>;

    // Prepare data for charts

    // Pie chart for spending by category
    const pieChartData = {
        labels: summary?.spendByCategory.map(item => item._id) || [],
        datasets: [
            {
                data: summary?.spendByCategory.map(item => item.total) || [],
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#E7E9EE', '#ADD8E6', '#FFD700', '#A9A9A9',
                    '#800000', '#008080'
                ],
                hoverBackgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#E7E9EE', '#ADD8E6', '#FFD700', '#A9A9A9',
                    '#800000', '#008080'
                ],
            },
        ],
    };
    const pieChartOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Spending by Category (This Month)',
            },
            legend: {
                position: 'right',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed);
                        }
                        return label;
                    }
                }
            }
        },
    };

    // Line chart for spending trends
    const lineChartLabels = summary?.spendingTrends.map(item => format(new Date(item._id), 'MMM dd')) || [];
    const lineChartDataValues = summary?.spendingTrends.map(item => item.total) || [];

    const lineChartData = {
        labels: lineChartLabels,
        datasets: [
            {
                label: 'Daily Spending (Last 30 Days)',
                data: lineChartDataValues,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            },
        ],
    };
    const lineChartOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Daily Spending Trends',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Amount (INR)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Date'
                }
            }
        }
    };


    // Bar chart for Budget vs Actual (This Month)
    const budgetBarLabels = budgetSummary?.map(item => item.category) || [];
    const budgetBarBudgeted = budgetSummary?.map(item => item.budgeted) || [];
    const budgetBarActual = budgetSummary?.map(item => item.actualSpend) || [];

    const budgetBarData = {
        labels: budgetBarLabels,
        datasets: [
            {
                label: 'Budgeted',
                data: budgetBarBudgeted,
                backgroundColor: 'rgba(54, 162, 235, 0.6)', // Blue
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
            {
                label: 'Actual Spend',
                data: budgetBarActual,
                backgroundColor: 'rgba(255, 99, 132, 0.6)', // Red
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

    const budgetBarOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Budget vs. Actual Spending (This Month)',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                stacked: false,
            },
            y: {
                beginAtZero: true,
                stacked: false,
                title: {
                    display: true,
                    text: 'Amount (INR)'
                }
            },
        },
    };


    return (
        <div className="dashboard-page">
            <h1>Dashboard</h1>

            <div className="dashboard-summary">
                <div className="card total-spend-card">
                    <h3>Total Spent This Month</h3>
                    <p>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(summary?.totalSpendThisMonth || 0)}</p>
                </div>

                <div className="card top-expenses-card">
                    <h3>Top Expense Days (Last 30 Days)</h3>
                    {summary?.topExpenseDays && summary.topExpenseDays.length > 0 ? (
                        <ul>
                            {summary.topExpenseDays.map((day, index) => (
                                <li key={index}>
                                    {format(new Date(day._id), 'MMM dd, yyyy')}:{' '}
                                    <strong>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(day.total)}</strong>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No top expense days recorded in the last 30 days.</p>
                    )}
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card pie-chart">
                    <Pie data={pieChartData} options={pieChartOptions} />
                </div>
                <div className="chart-card line-chart">
                    <Line data={lineChartData} options={lineChartOptions} />
                </div>
                <div className="chart-card bar-chart">
                    <Bar data={budgetBarData} options={budgetBarOptions} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;