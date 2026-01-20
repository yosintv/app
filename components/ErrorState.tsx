
import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
      <div className="bg-red-100 p-4 rounded-full text-red-500">
        <AlertCircle size={48} />
      </div>
      <h2 className="text-xl font-bold text-gray-800">Something went wrong</h2>
      <p className="text-gray-500 max-w-xs">{message}</p>
      <button 
        onClick={onRetry}
        className="bg-[#1f41bb] text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 active:scale-95 transition-transform"
      >
        <RefreshCcw size={20} />
        <span>Try Again</span>
      </button>
    </div>
  );
};

export default ErrorState;
