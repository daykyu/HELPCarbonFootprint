// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import DailyActivityLog from './pages/DailyActivityLog';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Recommendations from './pages/Recommendations';
import Layout from './components/Layout';

function App() {
  // Check if user is registered (has token)
  const isRegistered = localStorage.getItem('token');

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Protected routes dengan Layout */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="profile" element={<Profile />} />
        <Route path="daily-log" element={<DailyActivityLog />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="recommendations" element={<Recommendations />} />
        {/* Redirect ke daily-log setelah login */}
        <Route index element={<Navigate to="/daily-log" replace />} />
      </Route>

      {/* Default redirect */}
      <Route
        path="*"
        element={
          isRegistered ? 
            <Navigate to="/daily-log" replace /> :
            <Navigate to="/register" replace />
        }
      />
    </Routes>
  );
}

export default App;