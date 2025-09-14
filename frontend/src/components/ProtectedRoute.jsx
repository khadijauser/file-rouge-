import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (role && user.role !== role && user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;