 // src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  UserCircle,
  ActivitySquare,
  BarChart3,
  Users,
  History,
  BookOpen,
  LogOut,
  Lightbulb, // Icon baru untuk Recommendations
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: UserCircle,
      label: 'Profile',
      path: '/profile',
      testId: 'nav-profile'
    },
    {
      icon: ActivitySquare,
      label: 'Daily Activity Log',
      path: '/daily-log',
      testId: 'nav-activity'
    },
    {
      icon: BarChart3,
      label: 'Calculation Dashboard',
      path: '/dashboard',
      testId: 'nav-dashboard'
    },
    {
      icon: Lightbulb,
      label: 'Recommendations',
      path: '/recommendations',
      testId: 'nav-recommendations'
    },
    {
      icon: Users,
      label: 'Social Integration',
      path: '/social',
      testId: 'nav-social'
    },
    {
      icon: History,
      label: 'Historical Tracking',
      path: '/history',
      testId: 'nav-history'
    },
    {
      icon: BookOpen,
      label: 'Learn',
      path: '/learn',
      testId: 'nav-learn'
    }
  ];
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-indigo-900 shadow-lg" data-testid="sidebar">
      <div className="p-6 border-b border-indigo-800">
        <div className="flex items-center gap-4">
          <div className="min-w-[40px] h-10 bg-white rounded flex items-center justify-center">
            <svg 
              className="w-6 h-6 text-indigo-900" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
          </div>
          <span className="text-white text-xl font-bold" data-testid="app-title">
            HELP CARBON
          </span>
        </div>
      </div>

      <nav className="mt-6 flex flex-col justify-between h-[calc(100%-96px)]" data-testid="nav-menu">
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              data-testid={item.testId}
              className={`
                flex items-center px-6 py-3 text-gray-300 
                hover:bg-indigo-800 hover:text-white transition-all duration-200
                ${location.pathname === item.path 
                  ? 'bg-indigo-800 text-white border-l-4 border-white' 
                  : 'border-l-4 border-transparent'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="ml-4 text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-6 py-3 text-gray-300 
                     hover:bg-indigo-800 hover:text-white transition-all duration-200 
                     rounded-lg border border-gray-700"
            data-testid="logout-button"
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-4 text-sm font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;

