import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import bgImage from '../../assets/bg.jpg'; // Adjust path based on your folder structure

const AdminLayout = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex min-h-screen relative">
       {/* Background Image dengan Overlay */}
            <div 
              className="fixed inset-0 z-0" 
              style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />
            {/* Overlay untuk memberikan efek transparan */}
            <div 
              className="fixed inset-0 z-0 bg-blue-50 bg-opacity-85"
              aria-hidden="true"
            />

      {/* Content */}
      <div className="flex w-full min-h-screen relative z-10">
        <AdminSidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
        <div 
          className={`flex-1 transition-all duration-300 ease-in-out 
                      ${isExpanded ? 'lg:ml-64' : 'lg:ml-20'}`}
        >
          <div className="h-16 lg:hidden" />
          <main className="p-4 lg:p-8 w-full max-w-[1400px] mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float mix-blend-overlay"/>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float-delayed mix-blend-overlay"/>
      </div>
    </div>
  );
};

export default AdminLayout;