import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, error, setError } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrors({});
      
      const result = await login(formData);
      
      if (result) {
        toast.success(`Welcome back, ${result.name || 'User'}!`);
        
        const dashboardRoutes = {
          'patient': '/patient-dashboard',
          'doctor': '/doctor-dashboard',
          'admin': '/admin-dashboard'
        };
        
        const redirectPath = new URLSearchParams(window.location.search).get('redirect');
        navigate(redirectPath || dashboardRoutes[result.role] || '/');
      }
    } catch (err) {
      if (err.message.includes('403') || err.message.includes('permission')) {
        toast.error('You do not have permission to access this account. Please contact support.');
      } else if (err.message.includes('401') || err.message.includes('invalid')) {
        toast.error('Invalid email or password');
      } else {
        toast.error(err.message || 'Login failed. Please try again.');
      }
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-t from-cyan-100 to-[#CDC0B0] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-medical-blue/10">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-800">
            Sign in to your <span className="bg-gradient-to-r from-medical-pink to-medical-blue bg-clip-text text-transparent">account</span>
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link to="/register" className="font-medium text-medical-pink hover:text-medical-blue transition-colors duration-300">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-500 ${
                    errors.email 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-medical-pink focus:border-medical-pink'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-500 ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-medical-pink focus:border-medical-pink'
                  }`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-medical-pink to-medical-blue hover:shadow-lg hover:shadow-medical-pink/20 transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
      </div>
    </div>
  );
};

export default Login;