// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  
  // Jika belum login, arahkan ke register untuk membuat profile
  if (!token) {
    // Simpan intended location untuk redirect setelah login
    localStorage.setItem('intendedPath', location.pathname);
    return <Navigate to="/register" replace />;
  }
  
  return children;
};

export default PrivateRoute;