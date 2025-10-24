"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from backend
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include', // Include cookies for session
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUser(data.user);
          } else {
            // User not authenticated, use default
            setUser({ id: 'default_user', name: 'Guest User', email: 'guest@example.com' });
          }
        } else {
          // Backend not available or error, use default
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
