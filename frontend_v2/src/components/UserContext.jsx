"use client";
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { API } from '../lib/api';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const retriedRef = useRef(false);

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
          console.log('User not authenticated');
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // One-time short retry after initial load to catch late-arriving session cookie
  useEffect(() => {
    if (!loading && !user && !retriedRef.current) {
      retriedRef.current = true;
      const t = setTimeout(async () => {
        try {
          console.log('Retrying user fetch after delay...');
          const data = await API.getUser();
          if (data.success && data.user) {
            setUser(data.user);
          }
        } catch (e) {
          // ignore
        }
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [loading, user]);

  const refreshUser = async () => {
    try {
      console.log('Refreshing user data...');
      const data = await API.getUser();
      console.log('User API response data:', data);
      
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    userId: user?.id || 'default_user',
    userName: user?.name || 'Guest User',
    userEmail: user?.email || 'guest@example.com',
    refreshUser
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
