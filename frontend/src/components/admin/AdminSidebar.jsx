import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const AdminSidebar = ({ isExpanded, setIsExpanded }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/admin/dashboard',
      testId: 'nav-admin-dashboard'
    },
    {
      icon: FileText,
      label: 'Content Management',
      path: '/admin/educational',
      testId: 'nav-admin-content'
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/admin/settings',
      testId: 'nav-admin-settings'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const Logo = () => (
    <div className="relative flex items-center h-16 px-4">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-white rounded-lg overflow-hidden flex items-center justify-center">
          <img
            src="/src/assets/logo.png"
            alt="HELP CARBON Logo"
            className="w-14 h-14 object-contain"
          />
        </div>
        {isExpanded && (
          <span className="ml-4 text-white text-xl font-bold whitespace-nowrap">
            HELP CARBON
          </span>
        )}
      </div>
    </div>
  );

  const ToggleButton = () => (
    <button
      onClick={() => setIsExpanded(!isExpanded)}
      className={`
        absolute -right-3 top-1/2 -translate-y-1/2
        w-6 h-12
        bg-indigo-800 hover:bg-indigo-700
        text-white
        transition-all duration-200
        rounded-r-xl
        focus:outline-none
        shadow-lg
      `}
      data-testid="toggle-sidebar"
    >
      {isExpanded ? (
        <ChevronLeft className="w-4 h-4" />
      ) : (
        <ChevronRight className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <>
      {/* Mobile Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-indigo-900 z-50">
        <div className="flex items-center justify-between">
          <Logo />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-4"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40">
          <div className="fixed right-0 top-0 h-full w-64 bg-indigo-900 p-4">
            <nav className="flex-1 mt-16">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center px-4 py-3 text-gray-300 
                    hover:bg-indigo-800 hover:text-white
                    ${location.pathname === item.path ? 'bg-indigo-800 text-white' : ''}
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="ml-4 text-sm">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div 
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-indigo-900 
                    transition-all duration-300 ease-in-out z-50
                    ${isExpanded ? 'w-64' : 'w-20'}`}
      >
        <div className="relative border-b border-indigo-800">
          <Logo />
          <ToggleButton />
        </div>

        <nav className="flex-1 mt-4">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              data-testid={item.testId}
              className={`
                flex items-center px-4 py-3 text-gray-300 
                hover:bg-indigo-800 hover:text-white
                ${location.pathname === item.path ? 'bg-indigo-800 text-white' : ''}
                ${!isExpanded ? 'justify-center' : ''}
                group relative
              `}
            >
              <item.icon className="w-5 h-5" />
              {isExpanded && (
                <span className="ml-4 text-sm">{item.label}</span>
              )}
              {!isExpanded && (
                <div className="hidden group-hover:block absolute left-full ml-2 
                            bg-indigo-900 text-white px-3 py-2 rounded-md text-sm 
                            whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-indigo-800">
          <button
            onClick={handleLogout}
            className={`
              flex items-center text-gray-300 hover:bg-indigo-800 hover:text-white
              px-4 py-3 rounded-lg w-full
              ${!isExpanded ? 'justify-center' : ''}
              group relative
            `}
            data-testid="admin-logout-button"
          >
            <LogOut className="w-5 h-5" />
            {isExpanded && <span className="ml-4 text-sm">Logout</span>}
            {!isExpanded && (
              <div className="hidden group-hover:block absolute left-full ml-2 
                            bg-indigo-900 text-white px-3 py-2 rounded-md text-sm 
                            whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;