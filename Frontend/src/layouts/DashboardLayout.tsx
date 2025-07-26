import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import { ReminderNotificationProvider } from '../context/ReminderNotificationContext';

const DashboardLayout: React.FC = () => {
  return (
    <ReminderNotificationProvider>
      <div className="min-h-screen bg-pink-50">
        <main className="h-full">
          <Outlet />
        </main>
        <BottomNavigation />
      </div>
    </ReminderNotificationProvider>
  );
};

export default DashboardLayout;