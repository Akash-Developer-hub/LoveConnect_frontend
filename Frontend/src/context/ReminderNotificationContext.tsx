import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';

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

interface ReminderNotificationContextType {
  notification: string | null;
  setNotification: (msg: string | null) => void;
}

const ReminderNotificationContext = createContext<ReminderNotificationContextType>({
  notification: null,
  setNotification: () => {},
});

export const useReminderNotification = () => useContext(ReminderNotificationContext);

export const ReminderNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [notifiedIds, setNotifiedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const res = await axios.get('http://localhost:8000/loveconnect/api/reminders/', {
          withCredentials: true
        });
        const remindersWithDates = res.data.reminders.map((reminder: any) => ({
          ...reminder,
          id: reminder._id,
          date: new Date(reminder.date)
        }));
        setReminders(remindersWithDates);
      } catch (err) {
        // silent fail
      }
    };
    fetchReminders();
    const interval = setInterval(fetchReminders, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach(reminder => {
        if (!reminder.isCompleted && !notifiedIds.includes(reminder.id)) {
          const reminderDateTime = new Date(reminder.date);
          if (reminder.time) {
            const [hours, minutes] = reminder.time.split(':');
            reminderDateTime.setHours(Number(hours), Number(minutes), 0, 0);
          }
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

  return (
    <ReminderNotificationContext.Provider value={{ notification, setNotification }}>
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-pink-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-fade-in">
          <Bell className="w-5 h-5 mr-2" />
          <span>{notification}</span>
          <button
            className="ml-4 px-2 py-1 bg-white text-pink-600 rounded hover:bg-pink-100"
            onClick={() => setNotification(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      {children}
    </ReminderNotificationContext.Provider>
  );
};
