import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, notificationAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(!user || !token);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Auto-login to default persona if no session exists (Zero-Login Experience)
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
          fetchNotifications();
          setLoading(false);
          return;
        } catch (err) {
          console.warn('Session expired, auto-refreshing default persona', err);
        }
      }

      // Auto-authenticate as default Executive Persona (Alex Mercer - Tech CEO)
      try {
        const res = await authAPI.login({
          org_id: 'ORG-TECH',
          username: 'alex.ceo',
          password: 'password123',
        });
        const { access_token, user: userData } = res.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(access_token);
        setUser(userData);
        fetchNotifications();
      } catch (err) {
        console.error('Failed to auto-authenticate default persona', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getNotifications();
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const login = async (orgId, username, password) => {
    const res = await authAPI.login({
      org_id: orgId,
      username,
      password,
    });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    fetchNotifications();
    return userData;
  };

  // Reset to default CEO persona instead of clearing to blank login
  const logout = async () => {
    try {
      const res = await authAPI.login({
        org_id: 'ORG-TECH',
        username: 'alex.ceo',
        password: 'password123',
      });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to reset default persona', err);
    }
  };

  // Terminology helper based on organization configuration
  const getTerm = (key, fallback) => {
    if (!user || !user.terminology) return fallback;
    return user.terminology[key] || fallback;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        notifications,
        unreadCount,
        refreshNotifications: fetchNotifications,
        getTerm,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
