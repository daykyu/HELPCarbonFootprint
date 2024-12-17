// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Alert from '../components/Alert';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {

<p>The final version of the Login page</p>


    // Check temporary credentials dari registrasi
    const tempCredentials = sessionStorage.getItem('tempCredentials');
    if (tempCredentials) {
      const credentials = JSON.parse(tempCredentials);
      setFormData(credentials);
      sessionStorage.removeItem('tempCredentials');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', formData);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        
        // Check intended path jika ada
        const intendedPath = localStorage.getItem('intendedPath') || '/daily-log';
        localStorage.removeItem('intendedPath'); // Clear intended path
        navigate(intendedPath);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        content: error.response?.data?.message || 'Login failed. Please check your credentials.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center" data-testid="login-page">
      <div className="max-w-md mx-auto w-full px-6">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900" data-testid="login-title">
              Log In
            </h1>
          </div>

          <div className="mb-8 flex justify-center">
            <div className="w-32 h-32 bg-gray-200 flex items-center justify-center" data-testid="placeholder-image">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          {message.content && (
            <Alert type={message.type} message={message.content} />
          )}

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                placeholder="user123@gmail.com"
                data-testid="login-email-input"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                placeholder="••••••••"
                data-testid="login-password-input"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button
              type="submit"
              data-testid="login-submit"
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
            >
              Login
            </button>
          </form>

          {/* Tambahkan link ke registrasi */}
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-green-600 hover:text-green-700 font-medium"
                data-testid="register-link"
              >
                Create Profile
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-8 text-sm text-gray-500">
        Copyright © 2024 | All Rights Reserved<br />
        Developed by HELP University x STIKOM Students for BIT216 - Software Engineering Principles
      </div>
    </div>
  );
};

export default Login;