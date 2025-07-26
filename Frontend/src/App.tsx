import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pairing from './pages/Pairing';
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

function App() {
  return (
   <ThemeProvider>
    <AuthProvider>
      <ChatProvider>
        <GoogleOAuthProvider clientId="1037758248458-o372odjqq94ctstj66pcrt601058hn1k.apps.googleusercontent.com">
          <Router>
            <div className="min-h-screen bg-pink-50">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/pairing" element={<Pairing />} />
                <Route path="/forgot-pin" element={<ForgotPin />} />
                <Route path="/dashboard" element={
                  
                    <DashboardLayout />

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
              </Routes>
            </div>
          </Router>
        </GoogleOAuthProvider>
      </ChatProvider>
    </AuthProvider>
   </ThemeProvider>

  );
}

export default App;