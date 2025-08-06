import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pairing from './pages/Pairing';
import ProfileCompletion from './pages/ProfileCompletion';
import DashboardLayout from './layouts/DashboardLayout';
import Chat from './pages/Chat';
import Gallery from './pages/Gallery';
import Notes from './pages/Notes';
import Timeline from './pages/Timeline';
import Reminders from './pages/Reminders';
import Extras from './pages/Extras';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './components/ThemeContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ForgotPin from './pages/ForgotPin';
import { Heart } from 'lucide-react';
import Support from './pages/Support';
import NotFound from './pages/NotFound';

// Loading component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 flex items-center justify-center">
    <div className="text-center">
      <div className="bg-pink-600 p-3 rounded-full w-fit mx-auto mb-4 animate-pulse">
        <Heart className="w-6 h-6 text-white" fill="white" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">LoveConnect</h1>
      <p className="text-gray-600">Loading your love story...</p>
    </div>
  </div>
);

// App content with auth logic
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-pink-50">
        <Routes>
          <Route path="/support" element={<Support />} />
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/dashboard/chat" replace /> : <Login />
          } />
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard/chat" replace /> : <Login />
          } />
          <Route path="/signup" element={
            isAuthenticated ? <Navigate to="/dashboard/chat" replace /> : <Signup />
          } />
          <Route path="/pairing" element={
            isAuthenticated && user?.isPaired ? <Navigate to="/dashboard/chat" replace /> : <Pairing />
          } />
          <Route path="/profile-completion" element={<ProfileCompletion />} />
          <Route path="/forgot-pin" element={<ForgotPin />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard/chat" replace />} />
            <Route path="chat" element={<Chat />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="notes" element={<Notes />} />
            <Route path="timeline" element={<Timeline />} />
            <Route path="reminders" element={<Reminders />} />
            <Route path="extras" element={<Extras />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
   <ThemeProvider>
    <AuthProvider>
      <ChatProvider>
        <GoogleOAuthProvider clientId="1037758248458-o372odjqq94ctstj66pcrt601058hn1k.apps.googleusercontent.com">
          <AppContent />
        </GoogleOAuthProvider>
      </ChatProvider>
    </AuthProvider>
   </ThemeProvider>
  );
}

export default App;