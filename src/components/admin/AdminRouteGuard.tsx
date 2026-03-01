import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AdminRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6 text-center">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground text-sm">You don't have admin privileges.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRouteGuard;
