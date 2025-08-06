import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Home, ArrowLeft } from 'lucide-react';
import { useTheme } from '../components/ThemeContext';

const NotFound: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 text-gray-800'}`}>
      <div className="text-center p-4 w-full max-w-md mx-auto">
        {/* 404 Animation */}
        <div className="mb-6 relative">
          <h1 className={`text-7xl sm:text-9xl space-x-14 font-bold ${isDarkMode ? 'text-gray-700' : 'text-pink-300'} select-none`}>
            <span>4</span><span>4</span>
          </h1>
          <div className="absolute inset-0 flex items-center justify-center mt-3">
            <div className="bg-pink-600 p-3 sm:p-4 rounded-full animate-pulse">
              <Heart className="w-5 h-5 sm:w-8 sm:h-8 text-white" fill="white" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <h2 className={`text-xl sm:text-2xl font-bold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Oops! Love Story Not Found 💔
          </h2>
          <p className={`text-base sm:text-lg mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Looks like this page got lost in the journey of love!
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Don't worry, we'll help you find your way back to your love story.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard/chat')}
            className="w-full flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-xl hover:bg-pink-700 transition-colors font-medium"
          >
            <Home size={18} />
            Go Home
          </button>

          <button
            onClick={() => navigate(-1)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-colors font-medium border-2 ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                : 'border-pink-300 text-pink-600 hover:bg-pink-50'
            }`}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>

        {/* Decorative Hearts */}
        <div className="mt-8 flex justify-center space-x-2">
          <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isDarkMode ? 'text-gray-600' : 'text-pink-300'} animate-pulse`} fill="currentColor" />
          <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isDarkMode ? 'text-gray-600' : 'text-pink-300'} animate-pulse`} fill="currentColor" style={{ animationDelay: '0.5s' }} />
          <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isDarkMode ? 'text-gray-600' : 'text-pink-300'} animate-pulse`} fill="currentColor" style={{ animationDelay: '1s' }} />
        </div>

        {/* Additional Info */}
        <div className={`mt-6 text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          <p>If you think this is a mistake, please contact support</p>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-10 left-4 w-4 h-4 sm:w-6 sm:h-6 ${isDarkMode ? 'text-gray-800' : 'text-pink-200'} opacity-50`}>
          <Heart fill="currentColor" />
        </div>
        <div className={`absolute top-20 right-10 w-3 h-3 sm:w-4 sm:h-4 ${isDarkMode ? 'text-gray-800' : 'text-pink-200'} opacity-30`}>
          <Heart fill="currentColor" />
        </div>
        <div className={`absolute bottom-20 left-10 w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-gray-800' : 'text-pink-200'} opacity-40`}>
          <Heart fill="currentColor" />
        </div>
        <div className={`absolute bottom-10 right-4 w-2 h-2 sm:w-3 sm:h-3 ${isDarkMode ? 'text-gray-800' : 'text-pink-200'} opacity-60`}>
          <Heart fill="currentColor" />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
