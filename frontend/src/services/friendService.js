import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Tambahkan interceptor untuk debugging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Debug - Token being sent:', token); 
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        baseURL: config.baseURL
      });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const sendFriendRequest = async (receiverEmail) => {
  try {
    const response = await api.post('/friends/send-request', { receiverEmail });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('User with this email not found');
    }
    throw error;
  }
};

export const respondToFriendRequest = async (requestId, status) => {
    try {
      // Pastikan endpoint sesuai dengan backend
      const response = await api.put(`/friends/request/${requestId}`, {
        status: status 
      });
      
      // Debug response
      console.log('Response from accept/reject:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error responding to friend request:', error.response?.data || error.message);
      throw error;
    }
  };

  export const getPendingRequests = async () => {
    try {
      console.log('Making API request to get pending requests');
      const response = await api.get('/friends/pending-requests'); 
      console.log('API response:', response);
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  };

  // Tambahkan fungsi ini ke file friendService yang sudah ada
export const getFriendsList = async () => {
  try {
    console.log('Making API request to get friends list');
    const response = await api.get('/friends/list');
    console.log('API response:', response);
    return response.data;
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

