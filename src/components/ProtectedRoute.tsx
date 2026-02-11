import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from './ui';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { user, loading, isAdmin, userType } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const hasAccess = (() => {
    if (!user) return false;
    if (requireAdmin) return isAdmin;
    if (allowedRoles && allowedRoles.length > 0) {
      return userType !== null && allowedRoles.includes(userType);
    }
    return true; // authenticated, no role restriction
  })();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login', { state: { from: location } });
      } else if (!hasAccess) {
        navigate('/', { replace: true });
      }
    }
  }, [user, loading, hasAccess, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <Icon name="progress_activity" className="text-6xl text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <Icon name="lock" className="text-6xl text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
