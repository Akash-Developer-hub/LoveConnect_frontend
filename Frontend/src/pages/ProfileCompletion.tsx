import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, Users, ArrowRight } from 'lucide-react';

const ProfileCompletion: React.FC = () => {
  const [gender, setGender] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = location.state?.email || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!gender) {
      setError('Please select your gender.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://loveconnect-backend-kvb9.onrender.com/loveconnect/api/complete-google-profile/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ gender })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Profile completed, now go to pairing
        navigate('/pairing', { state: { email: userEmail } });
      } else {
        setError(data.error || 'Failed to complete profile. Please try again.');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-pink-600 p-3 rounded-full w-fit mx-auto mb-4">
            <Heart className="w-6 h-6 text-white" fill="white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">We need a bit more information to get you started</p>
        </div>

        {/* Gender Selection Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-blue-800 mb-1">Gender Information Required</h3>
              <p className="text-xs text-blue-700">
                LoveConnect uses gender information for pairing compatibility. 
                Only male-female partnerships are supported.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-3">
              Select Your Gender
            </label>
            <div className="space-y-3">
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  gender === 'male' 
                    ? 'border-pink-600 bg-pink-50' 
                    : 'border-gray-200 hover:border-pink-300'
                }`}
                onClick={() => setGender('male')}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="male"
                    name="gender"
                    value="male"
                    checked={gender === 'male'}
                    onChange={(e) => setGender(e.target.value)}
                    className="text-pink-600 focus:ring-pink-500"
                  />
                  <label htmlFor="male" className="cursor-pointer">
                    <div className="font-medium text-gray-800">Adam</div>
                    <div className="text-sm text-gray-600">Male</div>
                  </label>
                </div>
              </div>

              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  gender === 'female' 
                    ? 'border-pink-600 bg-pink-50' 
                    : 'border-gray-200 hover:border-pink-300'
                }`}
                onClick={() => setGender('female')}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="female"
                    name="gender"
                    value="female"
                    checked={gender === 'female'}
                    onChange={(e) => setGender(e.target.value)}
                    className="text-pink-600 focus:ring-pink-500"
                  />
                  <label htmlFor="female" className="cursor-pointer">
                    <div className="font-medium text-gray-800">Eve</div>
                    <div className="text-sm text-gray-600">Female</div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !gender}
            className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <span>Completing Profile...</span>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm">
            Your privacy is important to us. This information is only used for pairing purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;
