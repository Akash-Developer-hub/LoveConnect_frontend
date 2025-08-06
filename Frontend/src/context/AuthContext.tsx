import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  gender?: string;
  avatar?: string;
  partnerId?: string;
  partnerName?: string;
  partnerEmail?: string;
  isPaired?: boolean;
  partnerCode?: string;
  relationshipStatus?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pin: string) => Promise<boolean>;
  signup: (name: string, email: string, gender: string, pin: string) => Promise<boolean>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Utility to get token from localStorage
  const getToken = () => localStorage.getItem('loveconnect_token');

  // Auto-refresh token every 24 hours (to be safe with 30-day token)
  useEffect(() => {
    if (isAuthenticated) {
      // Only set up refresh interval after initial authentication
      const refreshInterval = setInterval(async () => {
        try {
          await fetch('https://loveconnect-backend-kvb9.onrender.com/loveconnect/api/refresh-token/', {
            method: 'POST',
            credentials: 'include'
          });
          console.log('Token refreshed automatically');
        } catch (error) {
          console.error('Auto token refresh failed:', error);
          // If refresh fails, user might need to login again
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('user');
        }
      }, 24 * 60 * 60 * 1000); // 24 hours

      return () => clearInterval(refreshInterval);
    }
  }, [isAuthenticated]);

  // Check authentication on app start only
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First try to get user from localStorage for immediate UI update
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAuthenticated(true);
          } catch {
            localStorage.removeItem('user');
          }
        }

        // Then verify with backend (only once on app start)
        const token = getToken();
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch('https://loveconnect-backend-kvb9.onrender.com/loveconnect/api/get-user/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          const user: User = {
            id: userData._id || userData.id,
            name: userData.name,
            email: userData.email,
            gender: userData.gender,
            isPaired: userData.isPaired,
            partnerCode: userData.partnerCode,
            partnerName: userData.partnerName,
            partnerEmail: userData.pairedWith,
            relationshipStatus: userData.relationshipStatus
          };
          
          setUser(user);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          // Clear any stale data if backend verification fails
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('loveconnect_token');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Don't clear data on network errors - maintain offline state
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAuthenticated(true);
          } catch {
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // Empty dependency array - only run once on mount

  const login = async (email: string, pin: string): Promise<boolean> => {
    try {
      const response = await fetch('https://loveconnect-backend-kvb9.onrender.com/loveconnect/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin })
      });

      const data = await response.json();

      if (data.token) {
        // Store token in cookie (expires in 30 days)
        document.cookie = `loveconnect=${data.token}; path=/; max-age=${30 * 24 * 60 * 60}; secure; samesite=strict`;
      }

      if (response.status === 403) {
        if (data.error?.includes('Your partner has taken a break')) {
          throw new Error(data.error);
        }
        if (data.error?.includes('You must pair with your partner')) {
          throw new Error('PAIRING_REQUIRED');
        }
        throw new Error(data.error || 'Access denied');
      }

      if (response.ok && data.token) {
        // Login successful - fetch user data
        const userResponse = await fetch('https://loveconnect-backend-kvb9.onrender.com/loveconnect/api/get-user/', {
          headers: {
            'Authorization': `Bearer ${data.token}`
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const user: User = {
            id: userData._id || userData.id,
            name: userData.name,
            email: userData.email,
            gender: userData.gender,
            isPaired: userData.isPaired,
            partnerCode: userData.partnerCode,
            partnerName: userData.partnerName,
            partnerEmail: userData.pairedWith,
            relationshipStatus: userData.relationshipStatus
          };

          setUser(user);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(user));
          return true;
        }
      }

      throw new Error(data.error || 'Login failed');
    } catch (error) {
      // Re-throw the error to be handled by the component
      throw error;
    }
  };

  const signup = async (name: string, email: string, gender: string, pin: string): Promise<boolean> => {
    try {
      const response = await fetch('https://loveconnect-backend-kvb9.onrender.com/loveconnect/api/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, gender, pin })
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
      // Optionally call backend logout if needed
      // await fetch('https://loveconnect-backend-kvb9.onrender.com/loveconnect/api/logout/', { method: 'POST' });
    } catch {
      // Ignore errors
    }

    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('loveconnect_token');
  };

  const refreshUserData = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch('https://loveconnect-backend-kvb9.onrender.com/loveconnect/api/get-user/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        const user: User = {
          id: userData._id || userData.id,
          name: userData.name,
          email: userData.email,
          gender: userData.gender,
          isPaired: userData.isPaired,
          partnerCode: userData.partnerCode,
          partnerName: userData.partnerName,
          partnerEmail: userData.pairedWith,
          relationshipStatus: userData.relationshipStatus
        };
        
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = async () => {
      console.log('Back online - checking auth status');
      try {
        const token = getToken();
        if (!token) return;

        const response = await fetch('https://loveconnect-backend-kvb9.onrender.com/loveconnect/api/get-user/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          const user: User = {
            id: userData._id || userData.id,
            name: userData.name,
            email: userData.email,
            gender: userData.gender,
            isPaired: userData.isPaired,
            partnerCode: userData.partnerCode,
            partnerName: userData.partnerName,
            partnerEmail: userData.pairedWith,
            relationshipStatus: userData.relationshipStatus
          };

          setUser(user);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (error) {
        console.error('Online auth check failed:', error);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, refreshUserData, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};