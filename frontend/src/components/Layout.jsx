import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import bgImage from '../assets/bg.jpg'; 

const Layout = () => {
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
        <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
        <div 
          className={`flex-1 transition-all duration-300 ease-in-out 
                    ${isExpanded ? 'lg:ml-64' : 'lg:ml-20'}`}
        >
          {/* Mobile header spacing */}
          <div className="h-16 lg:hidden" />
          
          <main className="p-4 lg:p-8 w-full max-w-[1200px] mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;