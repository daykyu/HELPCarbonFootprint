// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-blue-50">
      <Sidebar />
      <div className="flex-1 ml-64"> {/* Margin left sesuai dengan width sidebar */}
        <main className="p-8">
          <Outlet /> {/* Ini penting untuk menampilkan child routes */}
        </main>
      </div>
    </div>
  );
};

export default Layout;