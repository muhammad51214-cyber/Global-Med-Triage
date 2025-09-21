import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function DevelopmentNotice() {
  const { theme } = useTheme();

  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm transition-colors duration-300 ${
      theme === 'light' 
        ? 'bg-yellow-50 border border-yellow-200 shadow-lg' 
        : 'bg-yellow-500/10 border border-yellow-500/20 shadow-lg'
    } rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center">
            <span className="text-white text-sm">⚠️</span>
          </div>
        </div>
        <div className="flex-1">
          <h4 className={`text-sm font-semibold mb-1 transition-colors duration-300 ${
            theme === 'light' ? 'text-yellow-800' : 'text-yellow-200'
          }`}>
            Development Mode
          </h4>
          <p className={`text-xs transition-colors duration-300 ${
            theme === 'light' ? 'text-yellow-700' : 'text-yellow-300'
          }`}>
            Payment processing is simulated. No real transactions will occur.
          </p>
        </div>
        <button
          onClick={() => {
            // Hide the notice (you could add state management here)
            const notice = document.querySelector('[data-dev-notice]');
            if (notice) {
              notice.remove();
            }
          }}
          className={`flex-shrink-0 p-1 rounded transition-colors duration-300 ${
            theme === 'light' 
              ? 'hover:bg-yellow-100 text-yellow-600' 
              : 'hover:bg-yellow-500/20 text-yellow-400'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
