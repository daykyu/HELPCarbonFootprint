// src/components/Alert.jsx
import React from 'react';

const Alert = ({ type, message }) => {
  const alertStyles = {
    success: 'bg-green-100 text-green-700 border-green-400',
    error: 'bg-red-100 text-red-700 border-red-400',
    info: 'bg-blue-100 text-blue-700 border-blue-400'
  };

  return (
    <div
      className={`p-4 mb-4 rounded-md border ${alertStyles[type]}`}
      data-testid={`alert-${type}`}
    >
      <pre className="whitespace-pre-wrap font-sans">
        {message}
      </pre>
    </div>
  );
};

export default Alert;