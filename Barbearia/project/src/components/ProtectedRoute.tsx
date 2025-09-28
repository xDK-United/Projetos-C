import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isLoggedIn = localStorage.getItem('prestador_logado') === 'true';
  
  if (!isLoggedIn) {
    return <Navigate to="/login-prestador" replace />;
  }
  
  return <>{children}</>;
}