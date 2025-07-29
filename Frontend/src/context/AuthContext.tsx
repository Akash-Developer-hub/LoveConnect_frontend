import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  partnerId?: string;
  partnerName?: string;
  partnerEmail?: string;
  isPaired?: boolean;
  partnerCode?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pin: string) => Promise<boolean>;
  signup: (name: string, email: string, pin: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = async () => {
      try {
        // Get token from cookies
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('loveconnect='))
          ?.split('=')[1];

        const response = await fetch('https://loveconnect-backend-kvb9.onrender.com/loveconnect/api/get-user/', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          const user: User = {
            id: userData._id || userData.id,
            name: userData.name,
            email: userData.email,
            isPaired: userData.isPaired,
            partnerCode: userData.partnerCode,
            partnerName: userData.partnerName,
            partnerEmail: userData.pairedWith
          };
          
          setUser(user);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          // Clear any stale data
          localStorage.removeItem('user');
        }
      } catch {
        // If check fails, clear any stale data
        localStorage.removeItem('user');
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, pin: string): Promise<boolean> => {
    try {
      const response = await fetch('https://loveconnect-backend-kvb9.onrender.com/loveconnect/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, pin })
      });

      if (response.ok) {
        // Login successful - fetch user data
        // Get token from cookies
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('loveconnect='))
          ?.split('=')[1];

        const userResponse = await fetch('https://loveconnect-backend-kvb9.onrender.com/loveconnect/api/get-user/', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          credentials: 'include'
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const user: User = {
            id: userData._id || userData.id,
            name: userData.name,
            email: userData.email,
            isPaired: userData.isPaired,
            partnerCode: userData.partnerCode,
            partnerName: userData.partnerName,
            partnerEmail: userData.pairedWith
          };
          
          setUser(user);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(user));
          return true;
        }
      }
      
      return false;
    } catch {
      return false;
    }
  };

  const signup = async (name: string, email: string, pin: string): Promise<boolean> => {
    try {
      const response = await fetch('https://loveconnect-backend-kvb9.onrender.com/loveconnect/api/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, pin })
      });

      if (response.ok) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      // Get token from cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('loveconnect='))
        ?.split('=')[1];

      // Call backend logout to clear cookies
      await fetch('https://loveconnect-backend-kvb9.onrender.com/loveconnect/api/logout/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        credentials: 'include'
      });
    } catch {
      // Continue with logout even if backend call fails
    }
    
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};