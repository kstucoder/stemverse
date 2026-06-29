import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export default function ProtectedRoute({ children, role }) {
  const { user, token } = useAuthStore();
  const location = useLocation();

  if (!token || !user) return <Navigate to="/auth/login" state={{ from: location }} replace />;
  if (role && user.role !== role && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}
