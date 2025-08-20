
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Thinking..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-800 rounded-lg">
      <div className="w-12 h-12 border-4 border-t-indigo-500 border-gray-600 rounded-full animate-spin mb-4"></div>
      <p className="text-lg font-medium text-gray-300">{message}</p>
    </div>
  );
};
