import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Alert from '../components/Alert';
import bgImage from '../assets/bg.jpg';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    transportation: '',
    energy: '',
    dietary: '',
    reminderFrequency: 'daily'
  });
  const [message, setMessage] = useState({ type: '', content: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users/register', formData);

      if (response.data.success) {
        setMessage({
          type: 'success',
          content: `Registration successful!\nEmail: ${response.data.email}\nPassword: ${response.data.defaultPassword}\nPlease save these credentials to login.`
        });

        sessionStorage.setItem('tempCredentials', JSON.stringify({
          email: response.data.email,
          password: response.data.defaultPassword
        }));

        setTimeout(() => {
          navigate('/login');
        }, 5000);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        content: error.response?.data?.message || 'Registration failed. Please try again.'
      });
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Main content wrapper with padding */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Background Layers */}
        <div className="fixed inset-0 z-0">
          {/* Main Background Image */}
          <div 
            className="absolute inset-0 opacity-50 transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: 'brightness(1.1) contrast(0.9)',
            }}
          />

          {/* Gradient Overlay */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-emerald-900/5"
            style={{ mixBlendMode: 'soft-light' }}
          />

          {/* Glass Effect Base Layer */}
          <div className="absolute inset-0 backdrop-blur-[1px] bg-white/10" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-3xl">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 text-center" data-testid="register-title">
                Personal Information
              </h2>
            </div>

            {message.content && (
              <Alert type={message.type} message={message.content} />
            )}

            <form onSubmit={handleSubmit} className="space-y-6" data-testid="register-form">
              {/* Personal Information Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username*
                  </label>
                  <input
                    type="text"
                    id="username"
                    required
                    data-testid="username-input"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                             transition-all duration-200"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
                    data-testid="email-input"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                             transition-all duration-200"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    data-testid="phone-input"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                             transition-all duration-200"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Transportation, Energy, and Dietary Section */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="transportation" className="block text-sm font-medium text-gray-700 mb-1">
                    Transportation choice
                  </label>
                  <input
                    type="text"
                    id="transportation"
                    data-testid="transportation-input"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                             transition-all duration-200"
                    value={formData.transportation}
                    onChange={(e) => setFormData({ ...formData, transportation: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="energy" className="block text-sm font-medium text-gray-700 mb-1">
                    Energy sources
                  </label>
                  <input
                    type="text"
                    id="energy"
                    data-testid="energy-input"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                             transition-all duration-200"
                    value={formData.energy}
                    onChange={(e) => setFormData({ ...formData, energy: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="dietary" className="block text-sm font-medium text-gray-700 mb-1">
                    Dietary preferences
                  </label>
                  <input
                    type="text"
                    id="dietary"
                    data-testid="dietary-input"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                             transition-all duration-200"
                    value={formData.dietary}
                    onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="reminderFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder Frequency*
                  </label>
                  <select
                    id="reminderFrequency"
                    required
                    data-testid="activity-reminder-select"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                             transition-all duration-200"
                    value={formData.reminderFrequency}
                    onChange={(e) => setFormData({ ...formData, reminderFrequency: e.target.value })}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  data-testid="register-submit"
                  className="w-full md:w-auto md:min-w-[160px] block mx-auto px-8 py-3 
                           bg-green-500 text-white rounded-lg hover:bg-green-600 
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                           transform hover:scale-105 transition-all duration-200"
                >
                  Create Profile
                </button>
              </div>
            </form>

            {/* Login Link Section */}
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-green-600 hover:text-green-700 font-medium"
                  data-testid="login-link"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with proper spacing */}
      <div className="relative z-10 pb-8 pt-4 text-center text-sm ">
        Copyright © 2024 | All Rights Reserved<br />
        Developed by HELP University x STIKOM Students for BIT216 - Software Engineering Principles
      </div>

      {/* Animated Elements */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full 
                       blur-3xl animate-float mix-blend-overlay"/>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/5 rounded-full 
                       blur-3xl animate-float-delayed mix-blend-overlay"/>
      </div>
    </div>
  );
};

export default Register;