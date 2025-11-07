import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: string | string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log('🔍 ProtectedRoute check:', {
    isAuthenticated,
    isLoading,
    user: user ? { role: user.role, status: user.status } : null,
    requiredRole,
    currentPath: location.pathname
  });

  // Debug: Check localStorage
  console.log('🔍 LocalStorage check:', {
    authToken: localStorage.getItem('authToken') ? 'exists' : 'missing',
    authUser: localStorage.getItem('authUser') ? 'exists' : 'missing'
  });

  // Additional debug for project routes
  if (location.pathname.includes('/projects/')) {
    console.log('🔍 Project route access attempt:', {
      path: location.pathname,
      isAuthenticated,
      hasUser: !!user,
      userRole: user?.role,
      userStatus: user?.status
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const hasToken = !!localStorage.getItem('authToken');
    if (hasToken) {
      // Graceful loading state when token exists but auth context hasn't hydrated yet
      return (
        <div className="min-h-screen dashboard-bg flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
        </div>
      );
    }
    console.log('❌ ProtectedRoute: Not authenticated and no token, redirecting to login from:', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user) {
    console.log('❌ ProtectedRoute: No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check if user status is approved
      if (user.status !== 'approved') {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center">
        <div className="card p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Compte en attente d'approbation
          </h2>
          <p className="text-gray-300 mb-4">
            Votre compte est en cours de vérification par l'administrateur.
          </p>
          <p className="text-sm text-gray-400">
            Vous recevrez une notification une fois votre compte approuvé.
          </p>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (Array.isArray(requiredRole)) {
    if (!requiredRole.includes(user.role)) {
      console.log('❌ ProtectedRoute: Role not allowed:', { userRole: user.role, requiredRoles: requiredRole });
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="card p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Accès refusé
            </h2>
            <p className="text-slate-400">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Rôle requis: {requiredRole.join(' ou ')} | Votre rôle: {user.role}
            </p>
          </div>
        </div>
      );
    }
  } else {
    if (user.role !== requiredRole) {
      console.log('❌ ProtectedRoute: Role not allowed:', { userRole: user.role, requiredRole });
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="card p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Accès refusé
            </h2>
            <p className="text-slate-400">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Rôle requis: {requiredRole} | Votre rôle: {user.role}
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
