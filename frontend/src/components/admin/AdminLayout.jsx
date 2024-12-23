import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  console.log("AdminLayout rendering");

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <div 
        className={`flex-1 transition-all duration-300 ease-in-out 
                    ${isExpanded ? 'lg:ml-64' : 'lg:ml-20'}`}
      >
        <div className="h-16 lg:hidden" />
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;