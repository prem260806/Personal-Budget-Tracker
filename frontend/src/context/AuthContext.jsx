import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (err) {
          console.error('Failed to load user:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleLogoutEvent = () => logout();
    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: jwtToken, user: userData } = res.data;
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: jwtToken, user: createdUser } = res.data;
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(createdUser));
    setToken(jwtToken);
    setUser(createdUser);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    setUser(res.data.user);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  };

  const sendForgotOtp = async (identifier) => {
    const res = await api.post('/auth/forgot-password-otp', { identifier });
    return res.data;
  };

  const verifyOtp = async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  };

  const resetPassword = async (email, otp, newPassword) => {
    const res = await api.post('/auth/reset-password', { email, otp, newPassword });
    return res.data;
  };

  const formatCurrency = (amount, customCurrency = null) => {
    const curr = customCurrency || user?.currency || 'INR';
    const currencyMap = {
      INR: { locale: 'en-IN', symbol: '₹' },
      USD: { locale: 'en-US', symbol: '$' },
      EUR: { locale: 'de-DE', symbol: '€' },
      GBP: { locale: 'en-GB', symbol: '£' },
      CAD: { locale: 'en-CA', symbol: 'CA$' },
      AUD: { locale: 'en-AU', symbol: 'AU$' },
      SGD: { locale: 'en-SG', symbol: 'S$' },
      AED: { locale: 'ar-AE', symbol: 'AED ' },
    };

    const config = currencyMap[curr] || currencyMap.INR;
    const num = Number(amount) || 0;

    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: curr,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        updateProfile,
        sendForgotOtp,
        verifyOtp,
        resetPassword,
        formatCurrency,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
