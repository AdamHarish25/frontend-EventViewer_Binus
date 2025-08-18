// src/Pages/Auth/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ==========================================================
// INI PERBAIKANNYA: Jalur import yang benar
// `../../` untuk naik dua level (dari Auth -> ke Pages -> ke src)
// ==========================================================
import { mockUsers } from '../data/mockdata'; 

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('binus-event-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Gagal memuat sesi dari localStorage", error);
      localStorage.removeItem('binus-event-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (email, password) => {
    // Fungsi ini sekarang akan bekerja karena `mockUsers` tidak lagi undefined
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    if (foundUser) {
      const { password, ...userToStore } = foundUser;
      setUser(userToStore);
      localStorage.setItem('binus-event-user', JSON.stringify(userToStore));
      
      if (userToStore.role === 'admin' || userToStore.role === 'superadmin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
      return { success: true };
    }
    return { success: false, message: 'Email atau password salah.' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('binus-event-user');
    navigate('/');
  };

  const value = { user, login, logout, isAuthenticated: !!user, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};