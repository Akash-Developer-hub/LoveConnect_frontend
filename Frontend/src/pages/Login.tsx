import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBreakup, setIsBreakup] = useState(false);
  const [breakupReason, setBreakupReason] = useState('');
  const [youRequested, setYouRequested] = useState(false);
  const [partnerRequested, setPartnerRequested] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin, refreshUserData } = useAuth();

  const fetchBreakupStatus = async (email: string) => {
    try {
      const res = await fetch(`https://loveconnect-backend-kvb9.onrender.com/loveconnect/api/breakup-status?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setYouRequested(data.youRequested);
        setPartnerRequested(data.partnerRequested);
      }
    } catch (e) {
      console.error('Breakup status fetch failed');
    }
  };

  const sendPatchupRequest = async () => {
    try {
      const res = await fetch('https://loveconnect-backend-kvb9.onrender.com/loveconnect/api/request-patchup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setYouRequested(true);
        setError(data.message || 'Patch-up request sent');
      } else {
        setError(data.error || 'Request failed');
      }
    } catch (e) {
      setError('Network error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const success = await authLogin(email, pin);
      if (success) {
        navigate('/dashboard/chat');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'PAIRING_REQUIRED') {
          navigate('/pairing', { state: { email } });
          return;
        }
        if (error.message.includes('Your partner has taken a break')) {
          setIsBreakup(true);
          setBreakupReason(error.message.split(':')[1]?.trim() || 'No reason provided');
          await fetchBreakupStatus(email);
        } else {
          setError(error.message || 'Something went wrong. Please try again.');
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-pink-600 p-3 rounded-full w-fit mx-auto mb-4">
            <Heart className="w-6 h-6 text-white" fill="white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your LoveConnect account</p>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
              4-Digit PIN
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type={showPin ? 'text' : 'password'}
                id="pin"
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPin(value);
                }}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter your PIN"
                maxLength={4}
                required
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-3 w-5 h-5 text-gray-400 hover:text-gray-600"
              >
                {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-pink-600 text-white py-2 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
          <span className="text-center text-sm text-gray-500 justify-center flex items-center font-semibold">
            or
          </span>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                const token = credentialResponse.credential;
                if (!token) {
                  setError('Google sign-in failed: No token received');
                  return;
                }
                try {
                  const decoded: any = jwtDecode(token);
                  const email = decoded?.email;
                  const res = await fetch('https://loveconnect-backend-kvb9.onrender.com/loveconnect/api/google-signin/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ token })
                  });
                  const data = await res.json();
                  if (res.ok) {
                    const { login_success, profile_incomplete } = data;

                    if (profile_incomplete) {
                      navigate('/profile-completion', { state: { email } });
                      return;
                    }

                    if (login_success) {
                      await refreshUserData();
                      navigate('/dashboard/chat');
                    } else {
                      navigate('/pairing', { state: { email } });
                    }
                  } else {
                    if (data.error?.includes('Your partner has taken a break')) {
                      setIsBreakup(true);
                      setBreakupReason(data.error.split(':')[1]?.trim() || 'No reason provided');
                      await fetchBreakupStatus(email);
                    } else {
                      setError(data.error || 'Google sign-in failed');
                    }
                  }
                } catch (error) {
                  setError('Google sign-in failed');
                }
              }}
              onError={() => setError('Google sign-in failed')}
            />
          </div>
          {isBreakup && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm space-y-2">
              <p><strong>Reason:</strong> {breakupReason}</p>
              {!youRequested && (
                <>
                  {partnerRequested && (
                    <p className="text-xs text-pink-600 font-medium mb-1">
                      Your partner is ready to patch things up 💗
                    </p>
                  )}
                  <button
                    onClick={sendPatchupRequest}
                    type="button"
                    className="mt-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 w-full"
                  >
                    Send Patch-Up Request 💌
                  </button>
                </>
              )}
              {youRequested && !partnerRequested && (
                <p className="text-xs text-gray-500 mt-1">Waiting for your partner to agree... 💭</p>
              )}
              {youRequested && partnerRequested && (
                <p className="text-green-600 font-semibold">You both want to patch up! Please try logging in again 💖</p>
              )}
            </div>
          )}
        </form>
        {/* Footer */}
        <div className="mt-4 text-center">
          <Link
            to="/forgot-pin"
            className="text-pink-600 hover:text-pink-700 text-sm font-medium"
          >
            Forgot your PIN?
          </Link>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-pink-600 hover:text-pink-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
