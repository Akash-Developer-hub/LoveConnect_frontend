import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';

const ForgotPin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const navigator = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    if (step === 'email') {
      try {
        const res = await fetch('http://localhost:8000/loveconnect/api/forgot-pin/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) {
          setMessage(data.message || 'If this email is registered, you will receive instructions to reset your PIN.');
          setStep('verify');
        } else {
          setError(data.error || 'Something went wrong. Please try again.');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else if (step === 'verify') {
      // Verify OTP and set new PIN
      if (!otp || !newPin) {
        setError('Please enter the OTP and new PIN.');
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('http://localhost:8000/loveconnect/api/verify-reset-pin/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, resetCode: otp, newPin })
        });
        const data = await res.json();
        if (res.ok) {
          setMessage('PIN updated successfully! You can now log in with your new PIN.');
          setError('');
          setStep('email');
          setOtp('');
          setNewPin('');
          setTimeout(() => {
            navigator('/login');
          }, 1500);
        } else {
          setError(data.error || 'Invalid OTP or PIN.');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Forgot PIN?</h1>
          <p className="text-gray-600 mt-2">Enter your email to reset your PIN</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{message}</div>
          )}
          {step === 'email' && (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </>
          )}
          {step === 'verify' && (
            <>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="6-digit code"
                  maxLength={6}
                  required
                />
              </div>
              <div>
                <label htmlFor="newPin" className="block text-sm font-medium text-gray-700 mb-2">New 4-Digit PIN</label>
                <input
                  type="password"
                  id="newPin"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter new PIN"
                  maxLength={4}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Verifying...' : 'Verify & Change PIN'}
              </button>
            </>
          )}
        </form>
        <div className="mt-6 text-center">
          <Link to="/login" className="text-pink-600 hover:text-pink-700 text-sm font-medium">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPin;
