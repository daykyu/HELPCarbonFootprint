// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Alert from '../components/Alert';

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
    <div className="flex min-h-screen bg-blue-50" data-testid="register-page">
      {/* Sidebar included in the layout */}
      
        <div className="flex-1 p-8 ">
          <div className="bg-white rounded-lg shadow-sm p-6 max-w-3xl mx-auto">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h2 className="text-xl font-medium text-gray-900" data-testid="register-title">
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
                    data-testid="email-input"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              {/* Transportation, Energy, and Dietary Section */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="transportation" className="block text-sm font-medium text-indigo-900 mb-1">
                    Transportation choice
                  </label>
                  <input
                    type="text"
                    id="transportation"
                    data-testid="transportation-input"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.transportation}
                    onChange={(e) => setFormData({...formData, transportation: e.target.value})}
                  />
                </div>

                <div>
                  <label htmlFor="energy" className="block text-sm font-medium text-indigo-900 mb-1">
                    Energy sources
                  </label>
                  <input
                    type="text"
                    id="energy"
                    data-testid="energy-input"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.energy}
                    onChange={(e) => setFormData({...formData, energy: e.target.value})}
                  />
                </div>

                <div>
                  <label htmlFor="dietary" className="block text-sm font-medium text-indigo-900 mb-1">
                    Dietary preferences
                  </label>
                  <input
                    type="text"
                    id="dietary"
                    data-testid="dietary-input"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.dietary}
                    onChange={(e) => setFormData({...formData, dietary: e.target.value})}
                  />
                </div>

                
          

            
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  data-testid="register-submit"
                  className="block mx-auto w-40 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
    </div>
  );
};

export default Register;