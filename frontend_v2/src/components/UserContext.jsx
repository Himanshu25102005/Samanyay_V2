"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { API } from '../lib/api';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from backend
    const fetchUser = async () => {
      try {
        console.log('Fetching user data...');
        const data = await API.getUser();
        console.log('User API response data:', data);
        
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          // User not authenticated, use default
          console.log('User not authenticated, using default user');
          setUser({ id: 'default_user', name: 'Guest User', email: 'guest@example.com' });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        // Use default user on error
        setUser({ id: 'default_user', name: 'Guest User', email: 'guest@example.com' });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const value = {
    user,
    loading,
    userId: user?.id || 'default_user',
    userName: user?.name || 'Guest User',
    userEmail: user?.email || 'guest@example.com'
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
