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
        if (err.status !== 403) {
          setUser(null);
          clearToken();
        }
      } finally {
        setLoading(false);
      }
    };
    
    const token = getToken();
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    }
  }, []);

  const login = async (data) => {
    setError(null);
    try {
      const res = await apiRequest('/users/login', 'POST', data);
      
      if (res?.code === 'PASSWORD_CHANGE_REQUIRED') {
        return {
          requiresPasswordChange: true,
          resetToken: res.resetToken,
          email: data.email
        };
      }
      
      if (!res || !res.token || !res.user) {
        throw new Error('Invalid response from server');
      }
      
      setToken(res.token);
      
      const userData = {
        ...res.user,
        role: res.user.role || 'patient',
        permissions: res.user.permissions || []
      };
      
      setUser(userData);
      return userData;
      
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'Login failed';
      if (err.response?.data?.code === 'ACCOUNT_INACTIVE') {
        errorMessage = 'Your account is inactive. Please contact support.';
      } else if (err.response?.data?.code === 'INVALID_CREDENTIALS') {
        errorMessage = 'Invalid email or password';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
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