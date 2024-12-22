import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Alert from '../components/Alert';
import bgImage from '../assets/bg.jpg';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
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
    <div className="min-h-screen relative flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8" data-testid="login-page">
      {/* Background Layers */}
      <div className="fixed inset-0 z-0">
        {/* Main Background Image */}
        <div 
          className="absolute inset-0 opacity-30 transition-opacity duration-1000"
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
      <div className="relative z-10 max-w-md mx-auto w-full">
        <div className="bg-white shadow-lg rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900" data-testid="login-title">
              Log In
            </h1>
          </div>

          <div className="mb-8 flex justify-center">
            <div className="w-32 h-32 bg-gray-100 flex items-center justify-center rounded-full shadow-inner" data-testid="placeholder-image">
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                placeholder="user123@gmail.com"
                data-testid="login-email-input"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                         transition-all duration-200"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                placeholder="••••••••"
                data-testid="login-password-input"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                         transition-all duration-200"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button
              type="submit"
              data-testid="login-submit"
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg
                       hover:bg-green-600 focus:outline-none focus:ring-2 
                       focus:ring-green-500 focus:ring-offset-2
                       transform hover:scale-105 transition-all duration-200"
            >
              Login
            </button>
          </form>

          {/* Link ke registrasi */}
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-700">
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

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-700">
          Copyright © 2024 | All Rights Reserved<br />
          Developed by HELP University x STIKOM Students for BIT216 - Software Engineering Principles
        </div>
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

export default Login;