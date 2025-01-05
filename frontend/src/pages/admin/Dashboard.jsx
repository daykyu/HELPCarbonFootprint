import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Alert from '../../components/Alert';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Activity,
  BookOpen,
  Video,
  Image,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    activeSessions: 0,
    contentStats: {
      articles: { total: 0, trend: 'up', trendValue: 0 },
      videos: { total: 0, trend: 'up', trendValue: 0 },
      infographics: { total: 0, trend: 'up', trendValue: 0 }
    },
    recentUsers: []
  });
  const [message, setMessage] = useState({ type: '', content: '' });
  const [selectedMetric, setSelectedMetric] = useState('daily');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // src/pages/AdminDashboard.jsx
const fetchDashboardData = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log('Token being sent:', token);
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Sesuaikan dengan route yang ada
    const response = await axios.get('http://localhost:5000/api/users/admin/dashboard', {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      setStats(response.data.data);
    }
  } catch (error) {
    console.error('Full error:', error.response?.data);
    console.error('Dashboard error:', error);
    
    let errorMessage = 'Failed to fetch dashboard data';
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = 'Session expired. Please login again.';
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          navigate('/login');
          break;
        case 403:
          errorMessage = 'Access denied. Admin privileges required.';
          navigate('/login');
          break;
        default:
          errorMessage = error.response.data.message || errorMessage;
      }
    }

    setMessage({
      type: 'error',
      content: errorMessage
    });
  }
};


  const MetricCard = ({ title, value, icon: Icon, trend, trendValue, onClick, isSelected }) => (
    <div 
      className={`p-6 rounded-xl transition-all cursor-pointer
        ${isSelected 
          ? 'bg-indigo-50 border-2 border-indigo-500' 
          : 'bg-white hover:bg-gray-50 border border-gray-200'
        }`}
      onClick={onClick}
      data-testid={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-500">{title}</span>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <span className={`text-sm font-medium flex items-center
              ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {trendValue}%
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${isSelected ? 'bg-indigo-100' : 'bg-gray-100'}`}>
          <Icon className={`w-6 h-6 ${isSelected ? 'text-indigo-600' : 'text-gray-600'}`} />
        </div>
      </div>
    </div>
  );

  const ContentTypeCard = ({ type, stats, icon: Icon, color }) => (
    <div className={`p-4 bg-${color}-50 rounded-lg`} data-testid={`content-type-${type.toLowerCase()}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 text-${color}-600`} />
        <span className={`text-xs font-medium text-${color}-600`}>{type}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
      <div className="mt-2 flex items-center text-sm">
        {stats.trend === 'up' ? (
          <ArrowUpRight className="w-4 h-4 text-green-500" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-red-500" />
        )}
        <span className={`font-medium ${stats.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {stats.trendValue}%
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl p-8 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, Administrator!</h1>
        <p className="mt-2 text-gray-600">Monitor your platform's performance and manage content</p>
      </div>

      {message.content && (
        <Alert type={message.type} message={message.content} />
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend="up"
          trendValue="8.2"
          onClick={() => setSelectedMetric('users')}
          isSelected={selectedMetric === 'users'}
        />
        <MetricCard
          title="New Users Today"
          value={stats.newUsers}
          icon={UserPlus}
          trend="up"
          trendValue="12.5"
          onClick={() => setSelectedMetric('daily')}
          isSelected={selectedMetric === 'daily'}
        />
        <MetricCard
          title="Active Sessions"
          value={stats.activeSessions}
          icon={Activity}
          trend="down"
          trendValue="4.1"
          onClick={() => setSelectedMetric('sessions')}
          isSelected={selectedMetric === 'sessions'}
        />
      </div>

      {/* Content Stats and Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Educational Content Stats */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Educational Content</h2>
            <BarChart2 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <ContentTypeCard 
              type="Articles"
              stats={stats.contentStats.articles}
              icon={BookOpen}
              color="blue"
            />
            <ContentTypeCard 
              type="Videos"
              stats={stats.contentStats.videos}
              icon={Video}
              color="purple"
            />
            <ContentTypeCard 
              type="Infographics"
              stats={stats.contentStats.infographics}
              icon={Image}
              color="pink"
            />
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {stats.recentUsers.map((user, index) => (
              <div 
                key={user._id || index}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
                data-testid={`recent-user-${index}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-medium">
                      {user.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {stats.recentUsers.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No recent users found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;