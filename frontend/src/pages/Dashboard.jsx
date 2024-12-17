// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';

// Import view components
import AllView from '../components/views/AllView';
import TransportationView from '../components/views/TransportationView';
import EnergyView from '../components/views/EnergyView';
import DietaryView from '../components/views/DietaryView';

// Komponen untuk menampilkan circular progress dengan tooltip
const CircularProgress = ({ value, maxValue, color }) => {
  const percentage = (value / maxValue) * 100;
  const data = [
    { value: value, fill: color },
    { value: maxValue - value, fill: '#f3f4f6' }
  ];

  return (
    <div className="relative">
      <PieChart width={120} height={120}>
        <Pie
          data={data}
          cx={60}
          cy={60}
          innerRadius={45}
          outerRadius={55}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.fill} cornerRadius={40} />
          ))}
        </Pie>
        <text x={60} y={60} textAnchor="middle" dominantBaseline="middle" className="text-sm">
          {Math.round(percentage)}%
        </text>
      </PieChart>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [metadata, setMetadata] = useState({
    daysTracked: 0,
    isFirstDay: true,
    lastUpdate: null
  });
  const [footprintData, setFootprintData] = useState({
    projected: { annual: 0, unit: 'tons CO2e/year' },
    current: { daily: 0, unit: 'kg CO2e' },
    target: { 
      progress: 0,
      average: 8.6,    // Malaysia average
      goal: 4.73,      // 2030 target (45% reduction)
      unit: 'tons CO2e/year' 
    },
    breakdown: {
      transportation: { annual: 0, daily: 0, percentage: 0 },
      energy: { annual: 0, daily: 0, percentage: 0 },
      dietary: { annual: 0, daily: 0, percentage: 0 }
    }
  });

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [dashboardRes, historicalRes] = await Promise.all([
        axios.get('http://localhost:5000/api/activities/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/activities', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (dashboardRes.data.success) {
        setFootprintData(dashboardRes.data.footprint);
        if (dashboardRes.data.metadata) {
          setMetadata(dashboardRes.data.metadata);
        }
      }

      if (historicalRes.data.success) {
        setHistoricalData(historicalRes.data.activities);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Dashboard error:', error);
      setError('Failed to fetch dashboard data');
      setIsLoading(false);
    }
  };

  const handleUpdateActivity = () => {
    navigate('/daily-log');
  };

  const formatValue = (value, unit) => {
    if (value === 0) return '0';
    return value < 0.01 ? '< 0.01' : value.toFixed(2);
  };

  const isToday = (date) => {
    const today = new Date();
    const compareDate = new Date(date);
    return today.getDate() === compareDate.getDate() &&
           today.getMonth() === compareDate.getMonth() &&
           today.getFullYear() === compareDate.getFullYear();
  };

  const showInsufficientDataWarning = !footprintData.projected.annual || 
    (metadata.lastUpdate && !isToday(metadata.lastUpdate));

  const renderTabContent = () => {
    const todayData = historicalData[0] || {};

    switch(activeTab) {
      case 'transportation':
        return (
          <TransportationView 
            data={historicalData} 
            todayData={todayData} 
          />
        );
      case 'energy':
        return (
          <EnergyView 
            data={historicalData} 
            todayData={todayData} 
          />
        );
      case 'diet':
        return (
          <DietaryView 
            data={historicalData} 
            todayData={todayData} 
          />
        );
      default:
        return <AllView footprintData={footprintData} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen" data-testid="dashboard-loading">
        <div className="text-lg text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="dashboard-container">
      {/* Warning Banner */}
      {showInsufficientDataWarning && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4 flex justify-between items-center" 
             data-testid="insufficient-data-warning">
          <div className="flex items-center">
            <span className="text-orange-800">
              {!footprintData.projected.annual ? 'Insufficient Data' : 'Daily Update Required'}
            </span>
            <span className="ml-2 text-sm text-orange-700">
              {!footprintData.projected.annual 
                ? 'Please update your activity log to see accurate carbon footprint calculations'
                : 'Please update your activity log for today to maintain accurate tracking'
              }
            </span>
          </div>
          <button
            onClick={handleUpdateActivity}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            data-testid="update-activity-button"
          >
            Update Activity Log
          </button>
        </div>
      )}

      {/* Days Tracked Info */}
      {metadata.daysTracked > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <span className="text-blue-800">
            {metadata.isFirstDay ? 
              "First day of tracking! Your projections will become more accurate as you log more activities." :
              `Tracking ${metadata.daysTracked} day${metadata.daysTracked > 1 ? 's' : ''} of activities.`
            }
          </span>
        </div>
      )}

      {/* Main Grid - Three Cards at the Top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Projected Annual Footprint */}
        <div className="bg-white rounded-lg shadow p-6" data-testid="projected-annual-card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Projected Annual Footprint
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-blue-600">
                  {formatValue(footprintData.projected.annual)}
                </span>
                <span className="ml-2 text-gray-500">
                  {footprintData.projected.unit}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Based on {metadata.daysTracked} day{metadata.daysTracked !== 1 ? 's' : ''} of activity
              </p>
            </div>
            <CircularProgress 
              value={footprintData.projected.annual}
              maxValue={footprintData.target.average}
              color="#3B82F6"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Malaysia average: {footprintData.target.average} {footprintData.target.unit}
          </p>
        </div>

        {/* Today's Carbon Footprint */}
        <div className="bg-white rounded-lg shadow p-6" data-testid="daily-footprint-card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Today's Carbon Footprint 
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-green-600">
                  {formatValue(footprintData.current.daily)}
                </span>
                <span className="ml-2 text-gray-500">
                  {footprintData.current.unit}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Last updated: {metadata.lastUpdate ? new Date(metadata.lastUpdate).toLocaleString() : 'Not yet tracked'}
              </p>
            </div>
            <CircularProgress 
              value={footprintData.current.daily}
              maxValue={((footprintData.target.average * 1000) / 365)}
              color="#10B981"
            />
          </div>
        </div>

        {/* Target Progress */}
        <div className="bg-white rounded-lg shadow p-6" data-testid="target-progress-card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Target Progress
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-purple-600">
                  {Math.round(footprintData.target.progress)}%
                </span>
                <span className="ml-2 text-gray-500">of goal met</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Target {footprintData.target.goal} {footprintData.target.unit}
              </p>
            </div>
            <CircularProgress 
              value={footprintData.target.progress}
              maxValue={100}
              color="#8B5CF6"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Malaysia's 2030 target: 45% reduction from current average
          </p>
        </div>
      </div>

      {/* Emissions Breakdown */}
      <div className="mt-6 bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {['All', 'Transportation', 'Energy', 'Diet'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === tab.toLowerCase()
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500'
                }`}
                data-testid={`tab-${tab.toLowerCase()}`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Charts Section */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Impact Analysis & Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="tips-section">
          {[
            {
              category: 'Energy',
              getContent: (data) => ({
                status: data.breakdown.energy.percentage >= 40 ? 'Critical Attention Needed' :
                        data.breakdown.energy.percentage >= 25 ? 'Needs Improvement' : 'Well Managed',
                impact: `${data.breakdown.energy.percentage}% of total emissions (${formatValue(data.breakdown.energy.daily)} ${data.current.unit}/day)`,
                tip: data.breakdown.energy.percentage >= 40 
                  ? 'Your energy consumption is significantly high. Immediate actions recommended:\n' +
                    '• Switch to energy-efficient appliances\n' +
                    '• Implement timer switches for non-essential devices\n' +
                    '• Consider solar panel installation\n' +
                    '• Conduct an energy audit'
                  : data.breakdown.energy.percentage >= 25
                  ? 'Your energy usage could be optimized:\n' +
                    '• Regular maintenance of appliances\n' +
                    '• Use natural lighting when possible\n' +
                    '• Set optimal temperature controls'
                  : 'Keep maintaining good practices:\n' +
                    '• Continue monitoring usage patterns\n' +
                    '• Look for additional optimization opportunities'
              })
            },
            {
              category: 'Transportation',
              getContent: (data) => ({
                status: data.breakdown.transportation.percentage >= 40 ? 'Critical Attention Needed' :
                        data.breakdown.transportation.percentage >= 25 ? 'Needs Improvement' : 'Well Managed',
                impact: `${data.breakdown.transportation.percentage}% of total emissions (${formatValue(data.breakdown.transportation.daily)} ${data.current.unit}/day)`,
                tip: data.breakdown.transportation.percentage >= 40
                  ? 'Your transportation emissions are high. Consider:\n' +
                    '• Switch to public transportation\n' +
                    '• Implement carpooling\n' +
                    '• Consider electric/hybrid vehicles\n' +
                    '• Optimize travel routes'
                  : data.breakdown.transportation.percentage >= 25
                  ? 'Room for improvement in transportation:\n' +
                    '• Combine trips when possible\n' +
                    '• Regular vehicle maintenance\n' +
                    '• Use bike for short distances'
                  : 'Continue your eco-friendly transit:\n' +
                    '• Maintain current practices\n' +
                    '• Consider zero-emission options'
              })
            },
            {
              category: 'Dietary',
              getContent: (data) => ({
                status: data.breakdown.dietary.percentage >= 40 ? 'Critical Attention Needed' :
                        data.breakdown.dietary.percentage >= 25 ? 'Needs Improvement' : 'Well Managed',
                impact: `${data.breakdown.dietary.percentage}% of total emissions (${formatValue(data.breakdown.dietary.daily)} ${data.current.unit}/day)`,
                tip: data.breakdown.dietary.percentage >= 40
                  ? 'Your dietary choices have high impact. Consider:\n' +
                    '• Reduce meat consumption frequency\n' +
                    '• Choose local and seasonal produce\n' +
                    '• Plan meals to minimize waste\n' +
                    '• Incorporate more plant-based options'
                  : data.breakdown.dietary.percentage >= 25
                  ? 'Some room for dietary improvements:\n' +
                    '• Balance meat and plant-based meals\n' +
                    '• Choose sustainable seafood options\n' +
                    '• Minimize processed foods'
                  : 'Maintain your sustainable diet:\n' +
                    '• Continue current dietary choices\n' +
                    '• Explore more local food options'
              })
            }
          ].map((category) => {
            const content = category.getContent(footprintData);
            const impactLevel = 
              footprintData.breakdown[category.category.toLowerCase()].percentage >= 40 ? 'bg-red-50 border-red-200' :
              footprintData.breakdown[category.category.toLowerCase()].percentage >= 25 ? 'bg-yellow-50 border-yellow-200' :
              'bg-green-50 border-green-200';

            return (
              <div 
                key={category.category}
                className={`p-4 rounded-lg border ${impactLevel}`}
                data-testid={`tip-${category.category.toLowerCase()}`}
              >
                <h4 className="font-medium text-gray-900 mb-2">
                  {category.category}
                  <span className={`ml-2 text-sm ${
                    footprintData.breakdown[category.category.toLowerCase()].percentage >= 40 ? 'text-red-600' :
                    footprintData.breakdown[category.category.toLowerCase()].percentage >= 25 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    ({content.status})
                  </span>
                </h4>
                <p className="text-sm text-gray-600 mb-2">{content.impact}</p>
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {content.tip}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Last Update Info */}
      {metadata.lastUpdate && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Last data update: {new Date(metadata.lastUpdate).toLocaleString()}
        </div>
      )}
      <div className="text-center mt-8 text-sm text-gray-500">
        Copyright © 2024 | All Rights Reserved<br />
        Developed by HELP University x STIKOM Students for BIT216 - Software Engineering Principles
      </div>
    </div>
  );
};

export default Dashboard;
                  

