import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import Register from './pages/Register';
import Login from './pages/Login';
import DailyActivityLog from './pages/DailyActivityLog';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import PublishedContent from './pages/admin/PublishedContent';
import UploadContent from './pages/admin/UploadContent';
import Recommendations from './pages/Recommendations';
import SocialIntegration from './pages/SocialIntegration';
import Layout from './components/Layout';
import EditContent from './pages/admin/EditContent';

function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="educational" element={<PublishedContent />} />
        <Route path="educational/upload" element={<UploadContent />} />
        <Route path="educational/edit/:id" element={<EditContent />} /> {/* Add this line */}
      </Route>

      {/* Protected user routes */}
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
        <Route path="social" element={<SocialIntegration />} />
        <Route 
          index 
          element={
            role === 'admin' 
              ? <Navigate to="/admin/dashboard" replace />
              : <Navigate to="/daily-log" replace />
          } 
        />
      </Route>

      {/* Default redirect */}
      <Route
        path="*"
        element={
          token ? (
            role === 'admin' 
              ? <Navigate to="/admin/dashboard" replace />
              : <Navigate to="/daily-log" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;