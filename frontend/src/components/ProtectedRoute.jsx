import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { LoadingScreen } from './LoadingScreen';

export function ProtectedRoute({ children }) {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
