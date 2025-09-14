import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('nav')) {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'patient': return '/patient-dashboard';
      case 'doctor': return '/doctor-dashboard';
      case 'admin': return '/admin-dashboard';
      default: return '/';
    }
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const handleLinkClick = (e, to) => {
    if (location.pathname === to) {
      e.preventDefault();
      return;
    }
    
    document.body.style.opacity = '0.8';
    document.body.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
      document.body.style.opacity = '1';
    }, 300);
    
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black bg-opacity-50 backdrop-blur-md shadow-lg' : 'bg-black bg-opacity-20 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-full bg-white bg-opacity-10 p-1 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-medical-pink/20">
                <img src="/images/logolotus.png" alt="Lotus Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-medical-blue bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
                MediBeauty Vision
              </span>
            </Link>
          </div>


          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`relative px-2 py-1 font-medium transition-all duration-300 ${isActive('/') ? 'text-medical-pink' : 'text-white hover:text-medical-pink'}`}
              onClick={(e) => handleLinkClick(e, '/')}
            >
              Home
              {isActive('/') && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-medical-pink rounded-full"></span>}
            </Link>
            <Link 
              to="/services" 
              className={`relative px-2 py-1 font-medium transition-all duration-300 ${isActive('/services') ? 'text-medical-pink' : 'text-white hover:text-medical-pink'}`}
              onClick={(e) => handleLinkClick(e, '/services')}
            >
              Services
              {isActive('/services') && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-medical-pink rounded-full"></span>}
            </Link>
            <Link 
              to="/gallery" 
              className={`relative px-2 py-1 font-medium transition-all duration-300 ${isActive('/gallery') ? 'text-medical-pink' : 'text-white hover:text-medical-pink'}`}
              onClick={(e) => handleLinkClick(e, '/gallery')}
            >
              Gallery
              {isActive('/gallery') && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-medical-pink rounded-full"></span>}
            </Link>
            

            
            {user ? (
              <div className="flex items-center space-x-5">
                <Link 
                  to={getDashboardPath()} 
                  className={`relative group px-3 py-1.5 rounded-md transition-all duration-300 flex items-center space-x-2 ${isActive(getDashboardPath()) ? 'bg-white/10 text-medical-pink' : 'text-white hover:bg-white/5'}`}
                  onClick={(e) => handleLinkClick(e, getDashboardPath())}
                >
                  <User className={`w-4 h-4 transition-all duration-300 ${isActive(getDashboardPath()) ? 'text-medical-pink' : 'group-hover:text-medical-pink'}`} />
                  <span>Dashboard</span>
                  {isActive(getDashboardPath()) && <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-medical-pink rounded-full"></span>}
                </Link>
                <button
                  onClick={handleLogout}
                  className="group px-3 py-1.5 rounded-md transition-all duration-300 flex items-center space-x-2 text-white hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4 group-hover:text-red-500 transition-all duration-300" />
                  <span className="group-hover:text-red-500 transition-all duration-300">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="relative group px-4 py-1.5 text-white hover:text-medical-pink transition-all duration-300 font-medium"
                  onClick={(e) => handleLinkClick(e, '/login')}
                >
                  Login
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-medical-pink group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-medical-pink to-medical-blue text-white px-5 py-2 rounded-md hover:shadow-lg hover:shadow-medical-pink/20 hover:-translate-y-0.5 transition-all duration-300 font-medium"
                  onClick={(e) => handleLinkClick(e, '/register')}
                >
                  Register
                </Link>
              </div>
            )}
          </div>


          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-medical-pink transition-all duration-300 p-1.5 rounded-full hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {isOpen ? 
                <X className="w-6 h-6 transition-all duration-300" /> : 
                <Menu className="w-6 h-6 transition-all duration-300" />
              }
            </button>
          </div>
        </div>
      </div>


      <div 
        className={`md:hidden fixed inset-x-0 top-16 bg-black bg-opacity-80 backdrop-blur-md transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
      >
          <div className="px-4 pt-4 pb-6 space-y-2 border-t border-white/10 shadow-lg">
          <Link
            to="/"
            className={`block px-4 py-2.5 rounded-md ${isActive('/') ? 'bg-white/10 text-medical-pink' : 'text-white hover:bg-white/5'} transition-all duration-300 flex items-center space-x-3`}
            onClick={(e) => handleLinkClick(e, '/')}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-medical-pink"></span>
            <span>Home</span>
            {isActive('/') && <span className="ml-auto text-xs text-medical-pink">•</span>}
          </Link>
          <Link
            to="/services"
            className={`block px-4 py-2.5 rounded-md ${isActive('/services') ? 'bg-white/10 text-medical-pink' : 'text-white hover:bg-white/5'} transition-all duration-300 flex items-center space-x-3`}
            onClick={(e) => handleLinkClick(e, '/services')}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-medical-blue"></span>
            <span>Services</span>
            {isActive('/services') }
          </Link>
          <Link
            to="/gallery"
            className={`block px-4 py-2.5 rounded-md ${isActive('/gallery') ? 'bg-white/10 text-medical-pink' : 'text-white hover:bg-white/5'} transition-all duration-300 flex items-center space-x-3`}
            onClick={(e) => handleLinkClick(e, '/gallery')}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-medical-green"></span>
            <span>Gallery</span>
            {isActive('/gallery') }
          </Link>
          
          {user ? (
              <>
                <div className="mt-4 pt-4 border-t border-white/10"></div>
                <Link
                  to={getDashboardPath()}
                  className={`px-4 py-2.5 rounded-md ${isActive(getDashboardPath()) ? 'bg-white/10 text-medical-pink' : 'text-white hover:bg-white/5'} transition-all duration-300 flex items-center space-x-3`}
                  onClick={(e) => handleLinkClick(e, getDashboardPath())}
                >
                <span className="w-1.5 h-1.5 rounded-full bg-medical-green"></span>
                <span>Dashboard</span>
                  {isActive(getDashboardPath())}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full mt-2 px-4 py-2.5 rounded-md text-white hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 flex items-center space-x-3 text-left"
                >
                 <span className="w-1.5 h-1.5 rounded-full bg-medical-green"></span>
                  <span> Logout</span>
                </button>
              </>
            ) : (
              <>
                <div className="mt-4 pt-4 border-t border-white/10"></div>
                <Link
                  to="/login"
                  className="px-4 py-2.5 rounded-md text-white hover:bg-white/5 transition-all duration-300 flex items-center space-x-3"
                  onClick={(e) => handleLinkClick(e, '/login')}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-medical-blue"></span>
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="mt-2 px-4 py-2.5 rounded-md bg-gradient-to-r from-medical-pink to-medical-blue text-white transition-all duration-300 flex items-center space-x-3 font-medium hover:shadow-lg hover:shadow-medical-pink/20"
                  onClick={(e) => handleLinkClick(e, '/register')}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
    </nav>
  );
};

export default Navbar;