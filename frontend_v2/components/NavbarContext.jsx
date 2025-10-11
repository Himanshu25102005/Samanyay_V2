'use client'
import { createContext, useContext, useState, useEffect } from 'react';

const NavbarContext = createContext({
  isCollapsed: false,
  isMobileMenuOpen: false,
  isLargeScreen: false,
  setIsCollapsed: () => {},
  setIsMobileMenuOpen: () => {},
  setIsLargeScreen: () => {}
});

export const useNavbar = () => useContext(NavbarContext);

export default function NavbarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const largeScreen = window.innerWidth >= 1024;
      setIsLargeScreen(largeScreen);
      
      // Reset states when switching between mobile and desktop
      if (!largeScreen) {
        setIsCollapsed(false);
        setIsMobileMenuOpen(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <NavbarContext.Provider value={{
      isCollapsed,
      isMobileMenuOpen,
      isLargeScreen,
      setIsCollapsed,
      setIsMobileMenuOpen,
      setIsLargeScreen
    }}>
      {children}
    </NavbarContext.Provider>
  );
}
