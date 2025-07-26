import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import { User, Lock, Bell, Moon, Sun, Trash2, Edit3, Save, X, LogOut, Shield, Heart, Camera, AlertCircle, CheckCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [currentPin, setCurrentPin] = useState(['', '', '', '']);
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [relationshipStatus, setRelationshipStatus] = useState(user?.relationshipStatus || 'active');
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showBreakupModal, setShowBreakupModal] = useState(false);
  const [typingEffect, setTypingEffect] = useState('');

  // Floating hearts animation for love modal
  type Heart = { id: number; left: number; size: number; duration: number };
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [breakupReason, setBreakupReason] = useState('');
  const [notifications, setNotifications] = useState({
    messages: true,
    reminders: true,
    timeline: false
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleBreakupSignOut = async () => {
    try {
      if (!breakupReason.trim()) {
        showToast('Please provide a reason for the breakup 💔', 'error');
        return;
      }
      const statusRes = await fetch('http://localhost:8000/loveconnect/api/breakup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: breakupReason })
      });
      const statusData = await statusRes.json();
      if (!statusRes.ok) {
        showToast(statusData.error || 'Failed to update breakup status', 'error');
        return;
      }
      const res = await fetch('http://localhost:8000/loveconnect/api/logout/', {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        showToast('Breakup recorded 💔 Logging out...', 'info');
        setTimeout(() => {
          logout();
          navigate('/');
        }, 1000);
      } else {
        showToast('Logout failed. Try again.', 'error');
      }
    } catch (err) {
      showToast('Something went wrong. Try again.', 'error');
    }
  };

  const handleSaveProfile = async () => {
    await fetch('http://localhost:8000/loveconnect/api/update-profile/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name: editedName }),
    });
    setIsEditing(false);
  };

  const handleChangePin = async () => {
    const currentPinStr = currentPin.join('');
    const newPinStr = newPin.join('');
    const confirmPinStr = confirmPin.join('');
    if (newPinStr !== confirmPinStr) {
      setError('New PIN and Confirm PIN do not match');
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/loveconnect/api/change-pin/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          oldPin: currentPinStr,
          newPin: newPinStr,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to change PIN');
      }
      setShowChangePinModal(false);
      setCurrentPin(['', '', '', '']);
      setNewPin(['', '', '', '']);
      setConfirmPin(['', '', '', '']);
      setError('');
      showToast('PIN changed successfully! 💕', 'success');
    } catch (err) {
      showToast(
        typeof err === 'object' && err !== null && 'message' in err && typeof (err as any).message === 'string'
          ? (err as any).message
          : 'Failed to change PIN',
        'error'
      );
    }
  };

  const handleRelationshipStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch('http://localhost:8000/loveconnect/api/relationship-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (response.ok) {
        setRelationshipStatus(newStatus);
        showToast(`Relationship status updated to "${newStatus}" 💔`, 'success');
        setShowBreakModal(false);
      } else {
        showToast(data.error || 'Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Network error. Please try again.', 'error');
    }
  };

  const handleDigitChange = (e: React.ChangeEvent<HTMLInputElement>, index: number, type: string) => {
    const value = e.target.value.replace(/\D/, '');
    if (!value) return;
    const setter = {
      current: setCurrentPin,
      new: setNewPin,
      confirm: setConfirmPin,
    };
    const getter = {
      current: [...currentPin],
      new: [...newPin],
      confirm: [...confirmPin],
    };
    const updated = getter[type as keyof typeof getter];
    updated[index] = value;
    setter[type as keyof typeof setter](updated);
    // Auto-focus next input
    if (value && e.target.nextSibling instanceof HTMLElement) {
      e.target.nextSibling.focus();
    }
  };

  useEffect(() => {
    if (showBreakupModal && breakupReason === '') {
      const phrases = [
        "It's not you, it's me...",
        "We've grown apart...",
        "I need space...",
        "This isn't working anymore...",
        "You're amazing, but I'm exhausted...",
        "I think we want different things...",
        "I’ve changed. You’ve changed. The CSS is broken.",
        "Our love was a beta test. This is the final release.",
        "You deserve someone who doesn't forget the anniversary... deployment date.",
        "My heart’s 404 for you now.",
        "The spark’s gone... like the Wi-Fi.",
        "I need to focus on my own state management.",
        "We’re not component-compatible anymore.",
        "You're React, I'm Vue — we're just not interoperable.",
        "I ran `npm uninstall us`.",
        "The commit history shows too many issues.",
        "We’re in different branches now.",
        "Our relationship has too much technical debt.",
        "I’m refactoring my life without you.",
        "You ghosted like a service worker in incognito."
      ];
      let i = 0;
      let j = 0;
      let currentPhrase: string[] = [];
      let isDeleting = false;
      const type = () => {
        if (i < phrases.length) {
          if (!isDeleting && j <= phrases[i].length) {
            currentPhrase.push(phrases[i][j]);
            j++;
            setTypingEffect(currentPhrase.join(''));
          }
          if (isDeleting && j >= 0) {
            currentPhrase.pop();
            j--;
            setTypingEffect(currentPhrase.join(''));
          }
          if (j === phrases[i].length) {
            isDeleting = true;
            setTimeout(type, 1200);
            return;
          }
          if (isDeleting && j === 0) {
            currentPhrase = [];
            isDeleting = false;
            i++;
            if (i === phrases.length) i = 0;
          }
        }
        const speed = isDeleting ? 50 : 100;
        setTimeout(type, speed);
      };
      type();
    }
  }, [showBreakupModal, breakupReason]);

  const settingSections = [
    {
      title: 'Profile',
      items: [
        {
          icon: User,
          label: 'Edit Profile',
          action: () => setIsEditing(true),
          color: 'bg-blue-100 text-blue-600'
        },
        {
          icon: Lock,
          label: 'Change PIN',
          action: () => setShowChangePinModal(true),
          color: 'bg-purple-100 text-purple-600',
        },
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: isDarkMode ? Sun : Moon,
          label: 'Theme',
          action: toggleTheme,
          color: 'bg-yellow-100 text-yellow-600',
          toggle: true,
          checked: isDarkMode
        },
        {
          icon: Bell,
          label: 'Notifications',
          action: () => { },
          color: 'bg-green-100 text-green-600'
        }
      ]
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          icon: Shield,
          label: 'Privacy Settings',
          action: () => { },
          color: 'bg-indigo-100 text-indigo-600'
        },
        {
          icon: Heart,
          label: 'Relationship Status',
          action: () => setShowBreakModal(true),
          color: 'bg-pink-100 text-pink-600'
        }
      ]
    },
    {
      title: 'Account',
      items: [
        {
          icon: LogOut,
          label: 'Sign Out',
          action: () => setShowBreakupModal(true),
          color: 'bg-red-100 text-red-600'
        },
        {
          icon: Trash2,
          label: 'Delete Account',
          action: () => { },
          color: 'bg-red-100 text-red-600',
          disabled: true
        }
      ]
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 p-4 rounded-xl shadow-lg backdrop-blur-sm
              border-l-4 min-w-80 max-w-96 transform transition-all duration-300 ease-in-out
              animate-slide-in
              ${toast.type === 'success'
                ? 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-400 text-pink-800'
                : toast.type === 'error'
                  ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-400 text-red-800'
                  : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-400 text-purple-800'
              }
            `}
          >
            <div className="flex-shrink-0">
              {toast.type === 'success' && (
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                  <CheckCircle size={18} className="text-pink-600" />
                </div>
              )}
              {toast.type === 'error' && (
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle size={18} className="text-red-600" />
                </div>
              )}
              {toast.type === 'info' && (
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Heart size={18} className="text-purple-600" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium leading-5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      {/* Header */}
      <div className={` border-b ${isDarkMode ? 'border-pink-700 bg-gray-900' : 'border-gray-200 bg-white'} p-4 fixed top-0 left-0 w-full z-30 shadow-sm`}>
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm">Manage your account and preferences</p>
      </div>
      <div className="p-4 max-w-4xl mx-auto pt-28">
        {/* Profile Card */}
        <div className={`rounded-xl p-6 shadow-sm mb-6 border transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 border-pink-900 shadow-lg shadow-pink-500' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Profile</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className={`p-2 ${isDarkMode ? 'text-pink-500' : 'text-gray-600'} hover:text-pink-600 rounded-lg`}
              >
                <Edit3 size={16} />
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-pink-600 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-pink-600 text-white p-1 rounded-full hover:bg-pink-700">
                <Camera size={12} />
              </button>
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center space-x-2"
                    >
                      <Save size={16} />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedName(user?.name || '');
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-900 flex items-center space-x-2"
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold">{user?.name}</h3>
                  <p>{user?.email}</p>
                  {user?.partnerName && (
                    <p className="text-sm text-pink-600 mt-1">
                      Connected with {user.partnerName}
                    </p>
                  )}
                  <p className="text-sm text-pink-600 mt-1">
                    Status: {user?.relationshipStatus === 'break' ? 'Taking a break 💔' :
                      user?.relationshipStatus === 'pending_patchup' ? 'Patch-up pending 🤝' :
                        'In love ❤️'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Settings Sections */}
        <div className="space-y-6">
          {settingSections.map((section, index) => (
            <div key={index} className={`rounded-xl p-6 shadow-sm border transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 border-pink-900 shadow-lg shadow-pink-500' : 'bg-white'}`}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={item.action}
                    disabled={item.disabled}
                    className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${isDarkMode ? 'hover:bg-gray-600' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${item.color}`}>
                        <item.icon size={18} />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.toggle && (
                      <div className={`w-12 h-6 rounded-full transition-colors ${item.checked ? 'bg-pink-600' : 'bg-gray-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${item.checked ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Notifications Settings */}
        <div className='space-y-6 mt-6 pb-16'>
          <div className={`rounded-xl p-6 shadow-sm border transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 border-pink-900 shadow-lg shadow-pink-500' : 'bg-white'}`}>
            <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Messages</h4>
                  <p className="text-sm">Get notified about new messages</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, messages: !prev.messages }))}
                  className={`w-12 h-6 rounded-full transition-colors ${notifications.messages ? 'bg-pink-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${notifications.messages ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Reminders</h4>
                  <p className="text-sm">Get notified about upcoming reminders</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, reminders: !prev.reminders }))}
                  className={`w-12 h-6 rounded-full transition-colors ${notifications.reminders ? 'bg-pink-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${notifications.reminders ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Timeline Events</h4>
                  <p className="text-sm">Get notified about anniversary dates</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, timeline: !prev.timeline }))}
                  className={`w-12 h-6 rounded-full transition-colors ${notifications.timeline ? 'bg-pink-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${notifications.timeline ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
                </button>
              </div>
            </div>
          </div>
          {/* Change PIN Modal */}
          {showChangePinModal && (
            <div className="fixed inset-0 bg-pink-100/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
              {/* Floating hearts animation */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-pink-500 opacity-70 animate-pulse"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 5}s`,
                    }}
                  >
                    ❤️
                  </div>
                ))}
              </div>
              <div className={`p-6 rounded-2xl shadow-2xl border border-pink-900  shadow-pink-500 max-w-sm w-full relative ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <svg className="w-12 h-12 text-pink-500 drop-shadow animate-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-center text-pink-600 mt-6 mb-4">Secure Your Love PIN 💖</h2>
                {error && <p className="text-red-600 text-sm mb-2 text-center">{error}</p>}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1">Current PIN</label>
                    <div className="flex gap-2 justify-center">
                      {currentPin.map((digit, index) => (
                        <input
                          key={index}
                          type="password"
                          value={digit}
                          onChange={(e) => handleDigitChange(e, index, 'current')}
                          maxLength={1}
                          className="w-10 h-12 text-center text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">New PIN</label>
                    <div className="flex gap-2 justify-center">
                      {newPin.map((digit, index) => (
                        <input
                          key={index}
                          type="password"
                          value={digit}
                          onChange={(e) => handleDigitChange(e, index, 'new')}
                          maxLength={1}
                          className="w-10 h-12 text-center text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Confirm New PIN</label>
                    <div className="flex gap-2 justify-center">
                      {confirmPin.map((digit, index) => (
                        <input
                          key={index}
                          type="password"
                          value={digit}
                          onChange={(e) => handleDigitChange(e, index, 'confirm')}
                          maxLength={1}
                          className="w-10 h-12 text-center text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2 justify-center mt-4">
                    <button
                      onClick={handleChangePin}
                      className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors transform hover:scale-105"
                    >
                      Change PIN
                    </button>
                    <button
                      onClick={() => {
                        setShowChangePinModal(false);
                        setCurrentPin(['', '', '', '']);
                        setNewPin(['', '', '', '']);
                        setConfirmPin(['', '', '', '']);
                        setError('');
                      }}
                      className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors transform hover:scale-105"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Breakup Confirmation Modal */}
          {showBreakupModal && (
            <div className="fixed inset-0 bg-red-100/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
              <div className={`rounded-3xl p-6 w-full max-w-md shadow-2xl border border-red-200 relative ${isDarkMode ? 'bg-gray-900' : 'bg-white/90 backdrop-blur-md'}`}>
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 animate-throb">
                  <svg
                    className="w-14 h-14 text-red-500 drop-shadow-lg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-2.8 10.29l-2.2 2.2-1.7-1.7 2.2-2.2-2.2-2.2 1.7-1.7 2.2 2.2 2.2-2.2 1.7 1.7-2.2 2.2 2.2 2.2-1.7 1.7-2.2-2.2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-red-600 mt-8 mb-2 font-[Poppins]">
                  Breakup Confirmation <span className="animate-pulse">💔</span>
                </h2>
                <p className="text-sm mb-4">
                  Let us know why you're stepping away. They'll read this...
                </p>
                <div className="relative mb-4">
                  <textarea
                    className="w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 placeholder-red-300 text-red-700 transition-all font-mono"
                    rows={4}
                    placeholder={typingEffect}
                    value={breakupReason}
                    onChange={(e) => setBreakupReason(e.target.value)}
                    onFocus={() => setTypingEffect('')}
                  />
                  <div className="absolute bottom-3 right-3 text-red-300">💔</div>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleBreakupSignOut}
                    className="px-6 py-3 bg-gradient-to-r from-red-100 to-red-200 text-red-500 hover:text-white rounded-xl hover:from-red-300 hover:to-red-500 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-300 relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="inline-block animate-pulse">💔</span>
                      Confirm Breakup
                    </span>
                    <span className="absolute inset-0 bg-red-800 opacity-0 group-hover:opacity-10 transition-opacity"></span>
                  </button>
                  <button
                    onClick={() => {
                      setShowBreakupModal(false);
                      setBreakupReason('');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* App Info */}
          <div className={`rounded-xl p-6 shadow-sm border transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 border-pink-900 shadow-lg shadow-pink-500' : 'bg-white'}`}>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <div className="space-y-2 text-sm">
              <p>LoveConnect v1.0.0</p>
              <p>Made with ❤️ for couples everywhere</p>
              <p className="text-xs mt-4">
                © 2025 LoveConnect. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        @keyframes floatHeart {
          0% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-30px) scale(1.1);
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }
        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 2px currentColor);
          }
          50% {
            filter: drop-shadow(0 0 8px currentColor);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes throb {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        .animate-float {
          animation: floatHeart 5s ease-in-out infinite;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        .animate-throb {
          animation: throb 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Settings;
