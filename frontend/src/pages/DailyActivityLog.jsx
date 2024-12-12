// src/pages/DailyActivityLog.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Alert from '../components/Alert';

const DailyActivityLog = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    transportation: {
      type: '',
      distance: ''
    },
    energy: {
      type: '',
      amount: ''
    },
    dietary: {
      type: ''
    }
  });

  const [activityHistory, setActivityHistory] = useState([]);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activityStatus, setActivityStatus] = useState('need_update');

  const transportationOptions = [
    { value: 'car', label: 'Car' },
    { value: 'bus', label: 'Bus' },
    { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'bicycle', label: 'Bicycle' },
    { value: 'walking', label: 'Walking' }
  ];

  const energyOptions = [
    { value: 'coal', label: 'Coal Power' },
    { value: 'natural_gas', label: 'Natural Gas' },
    { value: 'solar', label: 'Solar Power' },
    { value: 'wind', label: 'Wind Power' }
  ];

  const dietaryOptions = [
    { value: 'meat_heavy', label: 'Meat Heavy' },
    { value: 'balanced', label: 'Balanced' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' }
  ];

  useEffect(() => {    
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const [profileRes, historyRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/activities', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        if (profileRes.data.success) {
          setFormData(prev => ({
            ...prev,
            transportation: {
              type: profileRes.data.user.transportation?.type || '',
              distance: ''
            },
            energy: {
              type: profileRes.data.user.energy?.type || '',
              amount: ''
            },
            dietary: {
              type: profileRes.data.user.dietary?.type || ''
            }
          }));
        }

        if (historyRes.data.success) {
          setActivityHistory(historyRes.data.activities);
          checkActivityStatus(historyRes.data.activities);
        }

        setIsLoading(false);
      } catch (error) {
        setMessage({
          type: 'error',
          content: 'Failed to load data'
        });
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    checkActivityStatus(activityHistory);
  }, [activityHistory]);

  const checkActivityStatus = (activities) => {
    const today = new Date().toISOString().split('T')[0];
    const hasActivityToday = activities.some(
      activity => activity.date.split('T')[0] === today
    );
    setActivityStatus(hasActivityToday ? 'updated' : 'need_update');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/activities',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setShowConfirmation(true);
        setActivityHistory(prev => [response.data.activity, ...prev]);
        setActivityStatus('updated');
        
        setFormData(prev => ({
          ...prev,
          transportation: { ...prev.transportation, distance: '' },
          energy: { ...prev.energy, amount: '' }
        }));

        setTimeout(() => {
          setShowConfirmation(false);
        }, 3000);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        content: error.response?.data?.message || 'Failed to update activity log'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto" data-testid="activity-log-page">
      {/* Input Form */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-medium text-gray-900" data-testid="activity-log-title">
            Your Daily Activity Log
          </h1>
          <div 
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activityStatus === 'updated'
                ? 'bg-green-100 text-green-800'
                : 'bg-orange-100 text-orange-800'
            }`}
            data-testid="activity-status"
          >
            {activityStatus === 'updated'
              ? 'Activity log is up to date!'
              : 'Please update your activity log!'}
          </div>
        </div>

        {message.content && (
          <Alert type={message.type} message={message.content} />
        )}

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="activity-log-form">
          <div>
            <label htmlFor="date" className="block text-sm text-indigo-900 mb-1">
              Date*
            </label>
            <input
              type="date"
              id="date"
              required
              data-testid="activity-date-input"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          {/* Transportation Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Transportation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="transportationType" className="block text-sm text-indigo-900 mb-1">
                  Mode*
                </label>
                <select
                  id="transportationType"
                  required
                  data-testid="activity-transportation-type-input"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.transportation.type}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    transportation: { ...prev.transportation, type: e.target.value }
                  }))}
                >
                  <option value="">Select mode</option>
                  {transportationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="transportationDistance" className="block text-sm text-indigo-900 mb-1">
                  Distance (km)*
                </label>
                <input
                  type="number"
                  id="transportationDistance"
                  required
                  min="0"
                  step="0.1"
                  data-testid="activity-transportation-distance-input"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.transportation.distance}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    transportation: { ...prev.transportation, distance: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Energy Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Energy Usage</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="energyType" className="block text-sm text-indigo-900 mb-1">
                  Source*
                </label>
                <select
                  id="energyType"
                  required
                  data-testid="activity-energy-type-input"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.energy.type}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    energy: { ...prev.energy, type: e.target.value }
                  }))}
                >
                  <option value="">Select source</option>
                  {energyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="energyAmount" className="block text-sm text-indigo-900 mb-1">
                  Amount (kWh)*
                </label>
                <input
                  type="number"
                  id="energyAmount"
                  required
                  min="0"
                  step="0.1"
                  data-testid="activity-energy-amount-input"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.energy.amount}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    energy: { ...prev.energy, amount: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Dietary Section */}
          <div>
            <label htmlFor="dietaryType" className="block text-sm text-indigo-900 mb-1">
              Dietary Choice*
            </label>
            <select
              id="dietaryType"
              required
              data-testid="activity-dietary-type-input"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.dietary.type}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                dietary: { type: e.target.value }
              }))}
            >
              <option value="">Select diet type</option>
              {dietaryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
  type="submit"
  data-testid="activity-submit"
  className="block mx-auto w-40 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
>
  Save Activity Log
</button>
        </form>
      </div>

      {/* Activity History */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h2>
        <div className="space-y-4">
          {activityHistory.map((activity, index) => (
            <div 
              key={activity._id || index}
              className="border-b border-gray-200 pb-4"
              data-testid={`activity-history-item-${index}`}
            >
              <div className="flex justify-between text-sm">
                <span className="font-medium">
                  {new Date(activity.date).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-2 space-y-2 text-sm text-gray-600">
                <div>Transportation: {activity.transportation.type} ({activity.transportation.distance} km)</div>
                <div>Energy: {activity.energy.type} ({activity.energy.amount} kWh)</div>
                <div>Dietary: {activity.dietary.type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="confirmation-modal">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
                <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Activity log updated successfully!</h2>
              <p className="text-gray-600">You can view your carbon footprint in the dashboard.</p>
            </div>
          </div>
        </div>
      )}
       <div className="text-center mt-8 text-sm text-gray-500">
        Copyright © 2024 | All Rights Reserved<br />
        Developed by HELP University x STIKOM Students for BIT216 - Software Engineering Principles
      </div>
    </div>
  );
};

export default DailyActivityLog;