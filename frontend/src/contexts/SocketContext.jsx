import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({});
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);

  // Ambil token dari localStorage
  const getToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  // Token decoder
  const decodeToken = useCallback((token) => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      // Pastikan struktur user sesuai dengan yang dibutuhkan
      return {
        userId: payload._id || payload.id || payload.userId, // cek berbagai kemungkinan field id
        username: payload.username || payload.name,
        // tambahkan field lain yang diperlukan
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }, []);

  // Effect untuk setup user dari token
  useEffect(() => {
    const token = getToken();
    if (token) {
      const userData = decodeToken(token);
      if (userData) {
        setUser(userData);
      }
    }
  }, [decodeToken, getToken]);

  // Effect untuk setup socket connection
  useEffect(() => {
    const token = getToken();
    
    if (!token || !user?.userId) {
      setError('Authentication required');
      return;
    }

    // Cleanup function untuk socket yang ada
    if (socket) {
      socket.disconnect();
    }

    const socketInstance = io(SOCKET_URL, {
      auth: {
        token,
        userId: user.userId // Pastikan menggunakan userId yang benar dari token
      },
      withCredentials: true,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socketInstance.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      setError(null);
      
      // Emit user connected event dengan data yang benar
      socketInstance.emit('user_connected', { 
        userId: user.userId,
        username: user.username // jika ada
      });
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError(`Connection error: ${err.message}`);
      setIsConnected(false);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('online_users', (users) => {
      setOnlineUsers(new Set(users));
    });

    socketInstance.on('user_online', (userId) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    socketInstance.on('user_offline', (userId) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    });

    socketInstance.on('private_message', (message) => {
      console.log('Received message in socket context:', message);
      
      setMessages(prev => {
        // Cek duplikasi berdasarkan id
        if (prev.some(m => m.id === message.id)) {
          return prev;
        }
        
        return [...prev, {
          id: message.id,
          content: message.content,
          from: message.from,
          to: message.to,
          timestamp: message.timestamp,
          fromSelf: message.from === user?.userId
        }];
      });
    });

    const handleTyping = (() => {
      const typingTimeouts = {};
      
      return ({ userId, username }) => {
        setTypingUsers(prev => ({
          ...prev,
          [userId]: { typing: true, username }
        }));

        if (typingTimeouts[userId]) {
          clearTimeout(typingTimeouts[userId]);
        }

        typingTimeouts[userId] = setTimeout(() => {
          setTypingUsers(prev => ({
            ...prev,
            [userId]: { typing: false, username }
          }));
        }, 3000);
      };
    })();

    socketInstance.on('user_typing', handleTyping);

    socketInstance.on('stop_typing', ({ userId }) => {
      setTypingUsers(prev => ({
        ...prev,
        [userId]: { typing: false, username: prev[userId]?.username }
      }));
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [user, getToken]); // Dependensi yang diperlukan

  const sendPrivateMessage = useCallback(async (recipientId, content) => {
    if (!socket?.connected || !user?.userId) {
      throw new Error('Not connected to chat server or user not authenticated');
    }
  
    const messageData = {
      id: Date.now().toString(),
      content,
      from: user.userId,
      to: recipientId,
      timestamp: new Date().toISOString()
    };
  
    return new Promise((resolve, reject) => {
      socket.emit('private_message', messageData, (response) => {
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          // Tidak perlu menambahkan ke messages di sini
          // karena akan ditangani oleh event listener 'private_message'
          resolve(response.message);
        }
      });
    });
  }, [socket, user]);

  const sendTypingIndicator = useCallback((recipientId) => {
    if (!socket?.connected || !user?.userId) return;
    
    socket.emit('typing', { 
      to: recipientId,
      userId: user.userId
    });
    
    setTimeout(() => {
      socket.emit('stop_typing', { 
        to: recipientId,
        userId: user.userId
      });
    }, 1000);
  }, [socket, user]);

  const value = {
    socket,
    isConnected,
    error,
    messages,
    onlineUsers: Array.from(onlineUsers),
    typingUsers,
    sendPrivateMessage,
    sendTypingIndicator,
    user
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
