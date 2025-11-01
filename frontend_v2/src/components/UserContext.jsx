"use client";
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { API } from '../lib/api';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const fetchUserOnce = async () => {
    try {
      const data = await API.getUser();
      if (data?.success && data.user) {
        setUser(data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      const ok = await fetchUserOnce();
      setLoading(false);
      if (!ok) scheduleRetry();
    };
    init();
    // Refresh on focus/visibility regain
    const onFocus = () => fetchUserOnce();
    const onVisible = () => document.visibilityState === 'visible' && fetchUserOnce();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const scheduleRetry = () => {
    if (retryCountRef.current >= maxRetries) return;
    const delay = 800 * (retryCountRef.current + 1); // 800ms, 1600ms, 2400ms
    retryCountRef.current += 1;
    setTimeout(async () => {
      const ok = await fetchUserOnce();
      if (!ok) scheduleRetry();
    }, delay);
  };

  const refreshUser = async () => {
    const ok = await fetchUserOnce();
    if (!ok) {
      // If user fetch fails, clear user state (e.g., after logout)
      setUser(null);
    }
    return ok;
  };

  const clearUser = () => {
    setUser(null);
  };

  const value = {
    user,
    loading,
    userId: user?.id || 'default_user',
    userName: user?.name || 'Guest User',
    userEmail: user?.email || 'guest@example.com',
    refreshUser,
    clearUser
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
