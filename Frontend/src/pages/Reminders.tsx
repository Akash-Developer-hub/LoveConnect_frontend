import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, Repeat, Bell, Edit3, Trash2, Check } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../components/ThemeContext'; // Adjust the import path as needed

interface Reminder {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  isCompleted: boolean;
  isRecurring: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdBy: string;
  priority: 'low' | 'medium' | 'high';
}

const Reminders: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [isCreating, setIsCreating] = useState(false);
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    title: '',
    description: '',
    date: new Date(),
    time: '12:00',
    isCompleted: false,
    isRecurring: false,
    priority: 'medium'
  });

  // Reminders data
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  // Notification state
  const [notification, setNotification] = useState<string | null>(null);
  const [notifiedIds, setNotifiedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const res = await axios.get('http://localhost:8000/loveconnect/api/reminders/', {
          withCredentials: true
        });
        // Convert date strings to Date objects
        const remindersWithDates = res.data.reminders.map((reminder: any) => ({
          ...reminder,
          id: reminder._id,
          date: new Date(reminder.date)
        }));
        setReminders(remindersWithDates);
      } catch (err) {
        console.error('Failed to fetch reminders:', err);
      }
    };
    fetchReminders();
  }, []);

  // Notification effect: check every minute for due reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach(reminder => {
        if (!reminder.isCompleted && !notifiedIds.includes(reminder.id)) {
          // Combine date and time
          const reminderDateTime = new Date(reminder.date);
          if (reminder.time) {
            const [hours, minutes] = reminder.time.split(':');
            reminderDateTime.setHours(Number(hours), Number(minutes), 0, 0);
          }
          // If reminder is due (within 2 minute window)
          if (
            now >= reminderDateTime &&
            now.getTime() - reminderDateTime.getTime() < 120000
          ) {
            setNotification(`Reminder: ${reminder.title} - ${reminder.description}`);
            setNotifiedIds(prev => [...prev, reminder.id]);
          }
        }
      });
    }, 10000); // check every 10 seconds
    return () => clearInterval(interval);
  }, [reminders, notifiedIds]);

  const handleCreateReminder = async () => {
    if (newReminder.title && newReminder.description) {
      try {
        if (isEditing && editingReminder) {
          // PATCH to update
          await axios.patch(
            `http://localhost:8000/loveconnect/api/reminders/update/${editingReminder.id}/`,
            newReminder,
            { withCredentials: true }
          );
        } else {
          // POST to create
          await axios.post(
            'http://localhost:8000/loveconnect/api/reminders/create/',
            newReminder,
            { withCredentials: true }
          );
        }
        // Reset UI state
        setIsEditing(false);
        setEditingReminder(null);
        setNewReminder({
          title: '',
          description: '',
          date: new Date(),
          time: '12:00',
          isCompleted: false,
          isRecurring: false,
          priority: 'medium'
        });
        setIsCreating(false);
        // Refresh list
        const refreshed = await axios.get('http://localhost:8000/loveconnect/api/reminders/', {
          withCredentials: true
        });
        const remindersWithDates = refreshed.data.reminders.map((reminder: any) => ({
          ...reminder,
          id: reminder._id,
          date: new Date(reminder.date)
        }));
        setReminders(remindersWithDates);
      } catch (err) {
        console.error('Error saving reminder:', err);
      }
    }
  };

  const toggleComplete = async (id: string) => {
    try {
      await axios.patch(`http://localhost:8000/loveconnect/api/reminders/complete/${id}/`, null, {
        withCredentials: true
      });
      const res = await axios.get('http://localhost:8000/loveconnect/api/reminders/', {
        withCredentials: true
      });
      // Convert date strings to Date objects
      const remindersWithDates = res.data.reminders.map((reminder: any) => ({
        ...reminder,
        id: reminder._id,
        date: new Date(reminder.date)
      }));
      setReminders(remindersWithDates);
    } catch (err) {
      console.error('Failed to toggle reminder:', err);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await axios.delete(`http://localhost:8000/loveconnect/api/reminders/delete/${id}/`, {
        withCredentials: true
      });
      const res = await axios.get('http://localhost:8000/loveconnect/api/reminders/', {
        withCredentials: true
      });
      // Convert date strings to Date objects
      const remindersWithDates = res.data.reminders.map((reminder: any) => ({
        ...reminder,
        id: reminder._id,
        date: new Date(reminder.date)
      }));
      setReminders(remindersWithDates);
    } catch (err) {
      console.error('Failed to delete reminder:', err);
    }
  };

  const formatDate = (date: Date) => {
    // Add safety check
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const sortedReminders = [...reminders].sort((a, b) => {
    // Sort by completion status first, then by date
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    return a.date.getTime() - b.date.getTime();
  });

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-pink-50 text-gray-800'}`}>
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 left-4 right-4 sm:top-6 sm:right-6 sm:left-auto z-50 ${isDarkMode ? 'bg-gray-700' : 'bg-pink-600'} text-white px-4 py-3 sm:px-6 rounded-lg shadow-lg flex items-start space-x-3 animate-fade-in max-w-sm sm:max-w-md`}>
          <Bell className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span className="text-sm sm:text-base flex-1 leading-relaxed">{notification}</span>
          <button
            className={`px-2 py-1 ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-pink-600'} rounded text-xs sm:text-sm hover:bg-pink-100 transition-colors duration-200 flex-shrink-0`}
            onClick={() => setNotification(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className={`px-4 py-4 sm:px-6 lg:px-8 sticky top-0 z-40 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-pink-200'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Reminders</h1>
              <p className={`text-sm sm:text-base mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {reminders.filter(r => !r.isCompleted).length} pending reminder{reminders.filter(r => !r.isCompleted).length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className={`p-3 sm:p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-pink-600'} text-white rounded-full hover:bg-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[48px] min-h-[48px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center`}
              aria-label="Create new reminder"
            >
              <Plus size={20} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className={`px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-6xl mx-auto ${isDarkMode ? 'text-gray-300' : ''}`}>
        {/* Create Form */}
        {isCreating && (
          <div className={`rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-pink-100'}`}>
            <h3 className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {isEditing ? 'Edit Reminder' : 'Create New Reminder'}
            </h3>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Title
                </label>
                <input
                  type="text"
                  value={newReminder.title || ''}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-4 py-3 sm:px-5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 text-sm sm:text-base transition-all duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-pink-200'}`}
                  placeholder="What do you need to remember?"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={newReminder.description || ''}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full px-4 py-3 sm:px-5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 h-20 sm:h-24 resize-none text-sm sm:text-base transition-all duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-pink-200'}`}
                  placeholder="Add some details..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={newReminder.date?.toISOString().split('T')[0] || ''}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, date: new Date(e.target.value) }))}
                    className={`w-full px-4 py-3 sm:px-5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 text-sm sm:text-base transition-all duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-pink-200'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Time
                  </label>
                  <input
                    type="time"
                    value={newReminder.time || ''}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, time: e.target.value }))}
                    className={`w-full px-4 py-3 sm:px-5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 text-sm sm:text-base transition-all duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-pink-200'}`}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Priority
                  </label>
                  <select
                    value={newReminder.priority || 'medium'}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                    className={`w-full px-4 py-3 sm:px-5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 text-sm sm:text-base transition-all duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-pink-200'}`}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={newReminder.isRecurring || false}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, isRecurring: e.target.checked }))}
                  className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500 border-pink-300"
                />
                <label htmlFor="isRecurring" className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>
                  Recurring reminder
                </label>
              </div>
              {newReminder.isRecurring && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Repeat Frequency
                  </label>
                  <select
                    value={newReminder.recurringType || 'daily'}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, recurringType: e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly' }))}
                    className={`w-full px-4 py-3 sm:px-5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 text-sm sm:text-base transition-all duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-pink-200'}`}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-2">
                <button
                  onClick={handleCreateReminder}
                  className={`px-6 py-3 sm:px-8 sm:py-3 ${isDarkMode ? 'bg-gray-700' : 'bg-pink-600'} text-white rounded-xl hover:bg-pink-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02] min-h-[48px] flex items-center justify-center`}
                >
                  {isEditing ? 'Update Reminder' : 'Create Reminder'}
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                    setEditingReminder(null);
                    setNewReminder({
                      title: '',
                      description: '',
                      date: new Date(),
                      time: '12:00',
                      isCompleted: false,
                      isRecurring: false,
                      priority: 'medium'
                    });
                  }}
                  className={`px-6 py-3 sm:px-8 sm:py-3 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-600'} text-white rounded-xl hover:bg-gray-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md min-h-[48px] flex items-center justify-center`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reminders List */}
        <div className="space-y-4 sm:space-y-6">
          {sortedReminders.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-pink-100'}`}>
                <Bell className={`w-8 h-8 sm:w-10 sm:h-10 ${isDarkMode ? 'text-gray-400' : 'text-pink-600'}`} />
              </div>
              <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>No reminders yet</h3>
              <p className={`text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Create your first reminder to stay organized and never miss important moments!
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className={`bg-pink-600 text-white px-6 py-3 sm:px-8 sm:py-3 rounded-xl hover:bg-pink-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02] min-h-[48px]`}
              >
                Create First Reminder
              </button>
            </div>
          ) : (
            sortedReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`rounded-xl p-4 sm:p-6 shadow-sm border-l-4 transition-all duration-200 hover:shadow-md ${reminder.isCompleted ? 'border-green-500 opacity-75' : 'border-pink-500'} ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="flex items-start justify-between space-x-3 sm:space-x-4">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <button
                      onClick={() => toggleComplete(reminder.id)}
                      className={`mt-1 p-2 sm:p-2.5 rounded-full transition-all duration-200 flex-shrink-0 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center ${
                        reminder.isCompleted
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-pink-100 text-pink-600 hover:bg-pink-200 transform hover:scale-105'
                      }`}
                      aria-label={reminder.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      <Check size={16} className="sm:w-5 sm:h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2 sm:mb-3">
                        <h3 className={`font-semibold text-sm sm:text-base leading-tight ${
                          reminder.isCompleted ? 'text-gray-500 line-through' : `text-gray-800 ${isDarkMode ? 'text-gray-200' : ''}`
                        }`}>
                          {reminder.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium w-fit ${getPriorityColor(reminder.priority)}`}>
                          {reminder.priority}
                        </span>
                      </div>
                      <p className={`text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed ${
                        reminder.isCompleted ? 'text-gray-400' : `text-gray-600 ${isDarkMode ? 'text-gray-400' : ''}`
                      }`}>
                        {reminder.description}
                      </p>
                      <div className={`flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                          <span className="font-medium">{formatDate(reminder.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                          <span>{reminder.time}</span>
                        </div>
                        {reminder.isRecurring && (
                          <div className="flex items-center space-x-1">
                            <Repeat size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                            <span className="capitalize">{reminder.recurringType}</span>
                          </div>
                        )}
                        <span className="hidden sm:inline">• {reminder.createdBy}</span>
                      </div>

                      {/* Mobile creator info */}
                      <div className="sm:hidden mt-2 text-xs text-gray-500">
                        Created by {reminder.createdBy}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setIsCreating(true);
                        setIsEditing(true);
                        setEditingReminder(reminder);
                        setNewReminder({
                          ...reminder,
                          date: new Date(reminder.date)
                        });
                      }}
                      className={`p-2 sm:p-2.5 ${isDarkMode ? 'text-gray-400 hover:text-pink-400' : 'text-gray-400 hover:text-pink-600'} rounded-lg hover:bg-pink-50 transition-all duration-200 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center`}
                      aria-label="Edit reminder"
                    >
                      <Edit3 size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className={`p-2 sm:p-2.5 ${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-600'} rounded-lg hover:bg-red-50 transition-all duration-200 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center`}
                      aria-label="Delete reminder"
                    >
                      <Trash2 size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Reminders;
