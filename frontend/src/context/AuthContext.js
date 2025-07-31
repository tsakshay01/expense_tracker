import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api'; 
import { useNavigate } from 'react-router-dom'; 

const AuthContext = createContext(null);


export const useAuth = () => {
    return useContext(AuthContext);
};


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); 
    const [loading, setLoading] = useState(true); 
    const navigate = useNavigate(); 

    
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token'); 
            if (token) {
                
                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
                    
                    const decodedToken = JSON.parse(atob(token.split('.')[1])); 
                    setUser({ _id: decodedToken.id, email: decodedToken.email }); 
                } catch (error) {
                    console.error('Invalid token or failed to verify:', error);
                    localStorage.removeItem('token'); 
                    setUser(null);
                    navigate('/login'); 
                }
            }
            setLoading(false); 
        };
        loadUser();
    }, [navigate]);

    
    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, _id, username, email: userEmail } = response.data;

            localStorage.setItem('token', token); 
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
            setUser({ _id, username, email: userEmail }); 
            navigate('/dashboard'); 
        } catch (error) {
            console.error('Login failed:', error.response?.data?.message || error.message);
            throw error; 
        }
    };

    
    const register = async (username, email, password) => {
        try {
            const response = await api.post('/auth/register', { username, email, password });
            const { token, _id, username: newUsername, email: newUserEmail } = response.data;

            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser({ _id, username: newUsername, email: newUserEmail });
            navigate('/dashboard');
        } catch (error) {
            console.error('Registration failed:', error.response?.data?.message || error.message);
            throw error;
        }
    };

    
    const logout = () => {
        localStorage.removeItem('token'); 
        delete api.defaults.headers.common['Authorization']; 
        setUser(null); 
        navigate('/login'); 
    };

    
    const authContextValue = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user, 
    };

    if (loading) {
        return <div>Loading authentication...</div>; 
    }

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};