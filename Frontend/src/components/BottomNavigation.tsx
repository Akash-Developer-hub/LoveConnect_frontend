import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext'; // Adjust the import path as needed
import {
  MessageCircle,
  Images,
  FileText,
  Clock,
  Bell,
  Heart,
  Settings
} from 'lucide-react';

interface ActiveIndicatorProps {
  isActive: boolean;
}

const ActiveIndicator: React.FC<ActiveIndicatorProps> = ({ isActive }) => {
  return isActive ? (
    <>
      {/* Red top bar (centered) */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-1 rounded bg-red-500 z-10" />
      {/* Spotlight cone (centered) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-b from-red-500 to-transparent rounded-full blur-2xl z-0" />
      {/* Heart icon (top-right of tab item) */}
      <div className="absolute top-2 right-0 translate-x-2 -translate-y-2 z-20">
        <Heart
          size={16}
          className="text-red-500 fill-red-500 drop-shadow-[0_0_6px_rgba(255,0,0,0.6)]"
        />
      </div>
    </>
  ) : null;
};

const BottomNavigation: React.FC = () => {
  const { isDarkMode } = useTheme();

  const navItems = [
    { to: '/dashboard/chat', icon: MessageCircle, label: 'Chat' },
    { to: '/dashboard/gallery', icon: Images, label: 'Gallery' },
    { to: '/dashboard/notes', icon: FileText, label: 'Notes' },
    { to: '/dashboard/reminders', icon: Bell, label: 'Reminders' },
    { to: '/dashboard/extras', icon: Heart, label: 'Extras' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <nav className={`fixed z-40 bottom-4 left-1/2 transform -translate-x-1/2 rounded-full w-full max-w-md sm:max-w-lg md:max-w-xl shadow-md backdrop-blur-sm ${
      isDarkMode
        ? 'bg-pink-300 border-t border-pink-700'
        : 'bg-pink-200/50 border-t border-pink-200'
    }`}>
      <div className="flex justify-around items-center px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 rounded-lg transition-colors relative ${
                isActive
                  ? 'text-pink-500'
                  : isDarkMode
                    ? 'text-pink-900 hover:text-pink-500'
                    : 'text-gray-600 hover:text-pink-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
                <ActiveIndicator isActive={isActive} />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
