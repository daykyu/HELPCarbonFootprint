import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Alert from '../components/Alert';
import { Camera } from 'lucide-react';

const Profile = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    profilePicture: '',
    transportation: {
      type: '',
      distance: 0
    },
    energy: {
      type: '',
      amount: 0
    },
    dietary: {
      type: ''
    },
    reminderFrequency: 'daily'
  });
  const [message, setMessage] = useState({ type: '', content: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

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
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setFormData({
            username: response.data.user.username || '',
            email: response.data.user.email || '',
            phone: response.data.user.phone || '',
            profilePicture: response.data.user.profilePicture || '',
            transportation: response.data.user.transportation || { type: '', distance: 0 },
            energy: response.data.user.energy || { type: '', amount: 0 },
            dietary: response.data.user.dietary || { type: '' },
            reminderFrequency: response.data.user.reminderFrequency || 'daily'
          });
          if (response.data.user.profilePicture) {
            setImagePreview(response.data.user.profilePicture);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error to fetch profile:', error);
        setMessage({
          type: 'error',
          content: 'Failed to fetch profile data. ' + (error.response?.data?.message || '')
        });
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        setMessage({
          type: 'error',
          content: 'Image size should not exceed 5MB'
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/users/update-profile',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setMessage({
          type: 'success',
          content: 'Profile updated successfully!'
        });

        setFormData(prevData => ({
          ...prevData,
          ...response.data.user
        }));

        setTimeout(() => {
          setMessage({ type: '', content: '' });
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        content: error.response?.data?.message || 'Failed to update profile'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-gray-600">Loading profile data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4" data-testid="profile-page">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-xl font-medium text-gray-900" data-testid="profile-title">
            Update Profile
          </h2>
        </div>

        {message.content && (
          <Alert type={message.type} message={message.content} />
        )}

        {/* Profile Picture Section */}
<div className="flex justify-center mb-8">
  <div className="relative group">
    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
      <img 
        src={imagePreview || "/src/assets/Profile.png"}
        alt="Profile" 
        className="w-full h-full object-cover"
        data-testid="profile-picture"
      />
    </div>
    <button
      type="button"
      onClick={triggerFileInput}
      className="absolute bottom-0 right-0 bg-indigo-900 text-white p-2 rounded-full 
                hover:bg-indigo-800 transition-colors group-hover:scale-110 
                shadow-lg hover:shadow-xl"
      data-testid="upload-photo-button"
    >
      <Camera size={20} />
    </button>
    <input
      type="file"
      ref={fileInputRef}
      className="hidden"
      accept="image/*"
      onChange={handleImageChange}
      data-testid="photo-input"
    />
  </div>
</div>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="profile-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username*
              </label>
              <input
                type="text"
                id="username"
                required
                data-testid="profile-username-input"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email*
              </label>
              <input
                type="email"
                id="email"
                required
                disabled
                data-testid="profile-email-input"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                value={formData.email}
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number*
              </label>
              <input
                type="tel"
                id="phone"
                required
                data-testid="profile-phone-input"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

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
                  data-testid="profile-transportation-type-input"
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
                  Average Daily Distance (km)
                </label>
                <input
                  type="number"
                  id="transportationDistance"
                  min="0"
                  step="0.1"
                  data-testid="profile-transportation-distance-input"
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
                  data-testid="profile-energy-type-input"
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
                  Daily Usage (kWh)
                </label>
                <input
                  type="number"
                  id="energyAmount"
                  min="0"
                  step="0.1"
                  data-testid="profile-energy-amount-input"
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

          <div>
            <label htmlFor="dietaryType" className="block text-sm text-indigo-900 mb-1">
              Dietary Choice*
            </label>
            <select
              id="dietaryType"
              required
              data-testid="profile-dietary-type-input"
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

          <div>
            <label htmlFor="reminderFrequency" className="block text-sm font-medium text-gray-700 mb-1">
              Reminder Frequency*
            </label>
            <select
              id="reminderFrequency"
              required
              data-testid="profile-reminder-select"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.reminderFrequency}
              onChange={(e) => setFormData({...formData, reminderFrequency: e.target.value})}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              data-testid="profile-submit"
              className="block mx-auto w-40 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
      <div className="text-center mt-8 text-sm text-gray-500">
        Copyright © 2024 | All Rights Reserved<br />
        Developed by HELP University x STIKOM Students for BIT216 - Software Engineering Principles
      </div>
    </div>
  );
};

export default Profile;