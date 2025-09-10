import { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, setToken, clearToken, getToken } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profile = await apiRequest('/users/me');
        setUser(profile);
      } catch (err) {
        setUser(null);
        clearToken();
      } finally {
        setLoading(false);
      }
    };
    if (getToken()) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (data) => {
    setError(null);
    try {
      const res = await apiRequest('/users/login', 'POST', data);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } catch (err) {
      setError(err.message || 'Login failed');
      return null;
    }
  };

  const register = async (data) => {
    setError(null);
    try {
      await apiRequest('/users/register', 'POST', data);
      const loggedInUser = await login({ email: data.email, password: data.password });
      return loggedInUser;
    } catch (err) {
      setError(err.message || 'Registration failed');
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    clearToken();
  };

  const refreshUser = async () => {
    try {
      const profile = await apiRequest('/users/me');
      setUser(profile);
      return profile;
    } catch (err) {
      return null;
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    refreshUser,
    loading,
    error,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};