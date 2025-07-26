import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Copy, Users, Plus, Hash } from 'lucide-react';

const Pairing: React.FC = () => {
  const [pairCode, setPairCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mode, setMode] = useState<'select' | 'generate' | 'enter'>('select');
  const [userEmail, setUserEmail] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        const email = parsedData.email || '';
        setUserEmail(email);
        console.log('User Email:', email);
        
        if (!email) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        navigate('/login');
      }
    } else {
      // Fallback to location.state if localStorage is empty
      const emailFromState = location.state?.email || '';
      if (emailFromState) {
        setUserEmail(emailFromState);
        console.log('User Email from state:', emailFromState);
      } else {
        navigate('/login');
      }
    }
  }, [location.state, navigate]);
  

  const generatePairCode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/loveconnect/api/pair-partner/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail })
      });

      const data = await response.json();
      
      if (response.ok) {
        setGeneratedCode(data.partnerCode);
        setSuccess('Pair code generated! Share this with your partner.');
      } else {
        setError(data.error || 'Failed to generate pair code');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const enterPairCode = async () => {
    if (!pairCode.trim()) {
      setError('Please enter a valid pair code');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/loveconnect/api/pair-partner/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email: userEmail,
          partnerCode: pairCode.toUpperCase()
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Successfully paired! You can now login.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.error || 'Failed to pair with the code');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setSuccess('Code copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handlePairCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setPairCode(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-pink-600 p-3 rounded-full w-fit mx-auto mb-4">
            <Heart className="w-6 h-6 text-white" fill="white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Pair with Your Partner</h1>
          <p className="text-gray-600 mt-2">Connect with your loved one to start chatting</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-6">
            {success}
          </div>
        )}

        {mode === 'select' && (
          <div className="space-y-4">
            <p className="text-center text-gray-600 mb-6">
              Choose how you want to connect with your partner:
            </p>
            
            <button
              onClick={() => setMode('generate')}
              className="w-full p-4 border-2 border-pink-200 rounded-lg hover:border-pink-600 hover:bg-pink-50 transition-colors flex items-center space-x-3"
            >
              <div className="bg-pink-600 p-2 rounded-full">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Generate New Code</h3>
                <p className="text-sm text-gray-600">Create a new pair code to share</p>
              </div>
            </button>

            <button
              onClick={() => setMode('enter')}
              className="w-full p-4 border-2 border-pink-200 rounded-lg hover:border-pink-600 hover:bg-pink-50 transition-colors flex items-center space-x-3"
            >
              <div className="bg-pink-600 p-2 rounded-full">
                <Hash className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Enter Partner's Code</h3>
                <p className="text-sm text-gray-600">Use a code shared by your partner</p>
              </div>
            </button>
          </div>
        )}

        {mode === 'generate' && (
          <div className="space-y-6">
            {!generatedCode ? (
              <div className="text-center">
                <Users className="w-16 h-16 text-pink-600 mx-auto mb-4" />
                <p className="text-gray-600 mb-6">
                  Generate a unique code that your partner can use to connect with you.
                </p>
                <button
                  onClick={generatePairCode}
                  disabled={isLoading}
                  className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Generating...' : 'Generate Pair Code'}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-6 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Your Pair Code:</p>
                  <div className="text-3xl font-bold text-pink-600 tracking-wider mb-3">
                    {generatedCode}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center justify-center space-x-2 mx-auto text-pink-600 hover:text-pink-700"
                  >
                    <Copy size={16} />
                    <span className="text-sm">Copy Code</span>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Share this code with your partner. Once they enter it, you'll both be paired!
                </p>
                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                  >
                    ← Back to Login
                  </Link>
                </div>
              </div>
            )}

            {!generatedCode && (
              <div className="text-center">
                <button
                  onClick={() => setMode('select')}
                  className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                >
                  ← Back to Options
                </button>
              </div>
            )}
          </div>
        )}

        {mode === 'enter' && (
          <div className="space-y-6">
            <div className="text-center">
              <Hash className="w-16 h-16 text-pink-600 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">
                Enter the 6-character code shared by your partner.
              </p>
            </div>

            <div>
              <label htmlFor="pairCode" className="block text-sm font-medium text-gray-700 mb-2">
                Partner's Pair Code
              </label>
              <input
                type="text"
                id="pairCode"
                value={pairCode}
                onChange={handlePairCodeChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center text-2xl font-bold tracking-wider"
                placeholder="ABC123"
                maxLength={6}
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <button
              onClick={enterPairCode}
              disabled={isLoading || pairCode.length !== 6}
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Pairing...' : 'Pair with Partner'}
            </button>

            <div className="text-center">
              <button
                onClick={() => setMode('select')}
                className="text-pink-600 hover:text-pink-700 text-sm font-medium"
              >
                ← Back to Options
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm">
            Need help?{' '}
            <Link to="/support" className="text-pink-600 hover:text-pink-700 font-medium">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pairing;
