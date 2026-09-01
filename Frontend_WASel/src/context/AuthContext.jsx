import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { translations } from '../i18n/translations';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('wasel_token') || null);
  const [theme, setTheme] = useState(localStorage.getItem('wasel_theme') || 'light');
  const [lang, setLang] = useState(localStorage.getItem('wasel_lang') || 'ar');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync theme
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wasel_theme', theme);
  }, [theme]);

  useEffect(() => {
    // Sync lang & dir
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('wasel_lang', lang);
  }, [lang]);

  useEffect(() => {
    // Load stored user info
    const storedUser = localStorage.getItem('wasel_user');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const authData = {
      id: res.userId,
      email: res.email,
      name: res.name,
      role: res.role,
    };
    localStorage.setItem('wasel_token', res.token);
    localStorage.setItem('wasel_user', JSON.stringify(authData));
    setToken(res.token);
    setUser(authData);
    return res;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('wasel_token');
    localStorage.removeItem('wasel_user');
    setToken(null);
    setUser(null);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleLang = () => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['ar']?.[key] || key;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      theme,
      lang,
      login,
      register,
      logout,
      toggleTheme,
      toggleLang,
      t,
      isAuthenticated: !!token && !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
