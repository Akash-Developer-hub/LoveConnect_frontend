import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Shield, Clock } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-pink-600 p-4 rounded-full">
              <Heart className="w-8 h-8 text-white" fill="white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            LoveConnect
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your private space to connect, share, and grow together. 
            Built exclusively for couples who want to stay close, no matter the distance.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors shadow-lg"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-white text-pink-600 px-8 py-3 rounded-xl font-semibold hover:bg-pink-50 transition-colors border-2 border-pink-600"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-pink-100 p-3 rounded-lg w-fit mb-4">
              <MessageCircle className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Private Chat</h3>
            <p className="text-gray-600">
              Secure messaging with photos, voice notes, and all your favorite emojis.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">100% Private</h3>
            <p className="text-gray-600">
              Your conversations and memories are encrypted and visible only to you two.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Shared Timeline</h3>
            <p className="text-gray-600">
              Create a beautiful timeline of your relationship milestones and memories.
            </p>
          </div>
        </div>

        {/* Sample Screenshots */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Everything you need to stay connected
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="bg-pink-100 h-48 rounded-lg mb-4 flex items-center justify-center">
                <MessageCircle className="w-16 h-16 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Chat & Share</h3>
              <p className="text-gray-600 text-sm mt-2">Send messages, photos, and voice notes</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="bg-purple-100 h-48 rounded-lg mb-4 flex items-center justify-center">
                <Heart className="w-16 h-16 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Love Notes</h3>
              <p className="text-gray-600 text-sm mt-2">Write and save special moments together</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="bg-green-100 h-48 rounded-lg mb-4 flex items-center justify-center">
                <Clock className="w-16 h-16 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Timeline</h3>
              <p className="text-gray-600 text-sm mt-2">Track your relationship journey</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>© 2025 LoveConnect. Made with ❤️ for couples everywhere.</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;