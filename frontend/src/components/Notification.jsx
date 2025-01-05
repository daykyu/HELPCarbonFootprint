// src/components/Notification.jsx
import React from 'react';
import { useNotification } from './NotificationContext';

const Notification = () => {
  const { notification } = useNotification();

  if (!notification) return null;

  return (
    <div className={`notification ${notification.type}`}>
      {notification.message}
    </div>
  );
};

export default Notification;
