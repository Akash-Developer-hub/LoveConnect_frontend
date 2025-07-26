import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Mic, Smile, CheckCircle, AlertCircle, Heart, X, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../components/ThemeContext'; // Adjust the import path as needed

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ChatMessage {
  id: string;
  senderEmail: string;
  content: string;
  type: string;
  timestamp: Date;
  imageUrl?: string;
  seen: boolean;
}

const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);

  const [isWindowVisible, setIsWindowVisible] = useState(!document.hidden);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      console.log('Visibility changed, isVisible:', isVisible);
      setIsWindowVisible(isVisible);
      if (
        isVisible &&
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        console.log('Sending mark_seen message');
        socketRef.current.send(JSON.stringify({ type: 'mark_seen' }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!user?.partnerCode) return;

    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('loveconnect'))?.split('=')[1];

    const socket = new WebSocket(`ws://localhost:8000/ws/chat/${user.partnerCode}/`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'reminder_alert') {
        const reminder = data.reminder;
        showToast(`🔔 Reminder: ${reminder.title} - ${reminder.description}`, 'info');
        return;
      }

      if (data.type === 'seen_update') {
        console.log('Received seen_update:', data);
        setMessages(prev =>
          prev.map(msg =>
            msg.id === data.message_id ? { ...msg, seen: data.seen } : msg
          )
        );
        return;
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        senderEmail: data.senderEmail,
        content: data.content,
        type: data.type,
        timestamp: new Date(data.timestamp),
        imageUrl: data.type === 'image' ? data.content : null,
        seen: data.seen || false
      }]);

      if (data.senderEmail !== user?.email) {
        setNotificationMsg('New message from your partner');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("LoveConnect", {
            body: data.type === 'image' ? 'Image received' : data.content,
            icon: "/favicon.ico"
          });
        }
      }
    };

    socket.onclose = () => {
      console.warn("WebSocket closed");
      showToast('Connection lost. Trying to reconnect...', 'error');
    };

    socket.onopen = () => {
      showToast('Connected to chat! 💕', 'success');
      if (isWindowVisible && socketRef.current?.readyState === WebSocket.OPEN) {
        console.log('Sending mark_seen on open');
        socketRef.current.send(JSON.stringify({ type: 'mark_seen' }));
      }
    };

    return () => {
      socket.close();
    };
  }, [user?.partnerCode, isWindowVisible]);

  const fetchMessages = async () => {
    try {
      const res = await fetch('http://localhost:8000/loveconnect/api/get-messages/', {
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.messages) {
        const mapped = data.messages.map((msg: any) => ({
          id: msg._id,
          senderEmail: msg.senderEmail,
          content: msg.content,
          type: msg.type,
          timestamp: new Date(msg.timestamp),
          imageUrl: msg.type === 'image' ? msg.content : null,
          seen: msg.seen || false
        }));
        setMessages(mapped);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      showToast('Failed to load messages. Please refresh', 'error');
    }
  };

  const sendMessageToBackend = async (content: string, type: string = 'text', imageUrl?: string) => {
    try {
      setIsLoading(true);

      const response = await fetch('http://localhost:8000/loveconnect/api/send-message/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: type,
          content: type === 'image' ? imageUrl : content
        })
      });

      if (response.ok) {
        await fetchMessages();
        if (type === 'image') {
          showToast('Image sent successfully! 📸💕', 'success');
        }
      } else {
        const err = await response.json();
        console.error('Failed to send message:', err.error || 'Unknown error');
        showToast('Failed to send message. Please try again', 'error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Failed to send message. Please try again', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      showToast('Please check your connection and try again', 'error');
      return;
    }

    const payload = {
      content: message,
      type: 'text'
    };

    socketRef.current.send(JSON.stringify(payload));
    setMessage('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast('Uploading your precious moment... 📸', 'info');
      const imageUrl = URL.createObjectURL(file);
      sendMessageToBackend('', 'image', imageUrl);
    }
  };

  const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-pink-50'}`}>
      {showNotification && (
        <div className="fixed top-0 left-0 w-full bg-pink-600 text-white text-center py-2 z-50 transition">
          {notificationMsg}
        </div>
      )}

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
                  {toast.message.includes('🔔') ? (
                    <Bell size={18} className="text-purple-600" />
                  ) : (
                    <Heart size={18} className="text-purple-600" />
                  )}
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
      <div className={` border-b border-pink-200 p-4 fixed w-full z-10 top-0 animate-slide-in ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.partnerName?.charAt(0) || 'P'}
              </span>
            </div>
            <div>
              <h1 className="font-semibold ">
                {user?.partnerName || 'Partner'}
              </h1>
              <p className="text-sm text-green-600">Online</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-20 pb-24">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderEmail === user?.email ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${msg.senderEmail === user?.email
                ? 'bg-pink-600 text-white'
                : 'bg-white text-gray-800 border border-pink-200'
                }`}
            >
              {msg.type === 'image' ? (
                <div className="space-y-2">
                  <img
                    src={msg.imageUrl}
                    alt="Shared image"
                    className="rounded-lg max-w-full h-auto"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs opacity-75">{formatTime(msg.timestamp)}</p>
                    {msg.senderEmail === user?.email && (
                      <span className={`text-xs ${msg.seen ? 'text-blue-500' : 'text-gray-500'}`}>
                        {msg.seen ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="break-words">{msg.content}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs opacity-75">{formatTime(msg.timestamp)}</p>
                    {msg.senderEmail === user?.email && (
                      <span className={`text-xs ${msg.seen ? 'text-blue-500' : 'text-gray-500'}`}>
                        {msg.seen ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className={` p-4 fixed bottom-14 w-full mb-6 ${isDarkMode ? 'bg-gray-800 border border-pink-600 rounded-xl' : 'bg-white border-t border-pink-200 '}`}>
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className={`w-full px-4 py-2 pr-12 rounded-full border border-pink-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} transition-colors`}
            />
          </div>

          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="p-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      </div>

      <style>
        {`
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
        `}
      </style>
    </div>
  );
};

export default Chat;