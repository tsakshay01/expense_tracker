import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // To access authentication state

const Header = () => {
    const { isAuthenticated, logout, user } = useAuth(); 

    return (
        <header className="header">
            <div className="logo">
                <Link to={isAuthenticated ? "/dashboard" : "/login"}>
                    Expense Planner
                </Link>
            </div>
            <nav>
                {isAuthenticated ? (
                    <ul>
                        <li>Welcome, {user?.username || user?.email}!</li> {/* Display username or email */}
                        <li>
                            <Link to="/dashboard">Dashboard</Link>
                        </li>
                        <li>
                            <Link to="/expenses">Expenses</Link>
                        </li>
                        <li>
                            <Link to="/budgets">Budgets</Link>
                        </li>
                        <li>
                            <button onClick={logout} className="btn btn-danger">Logout</button>
                        </li>
                    </ul>
                ) : (
                    <ul>
                        <li>
                            <Link to="/login">Login</Link>
                        </li>
                        <li>
                            <Link to="/register">Register</Link>
                        </li>
                    </ul>
                )}
            </nav>
        </header>
    );
};

export default Header;