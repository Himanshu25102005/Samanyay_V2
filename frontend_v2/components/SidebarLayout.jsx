"use client";
import { usePathname } from "next/navigation";
import { useNavbar } from "./NavbarContext.jsx";
import Navbar from "./Navbar.jsx";

export default function SidebarLayout({ children }) {
  const pathname = usePathname();
  const isHomeOrLogin = pathname === "/" || pathname?.toLowerCase() === "/login";
  const { isCollapsed, isMobileMenuOpen, isLargeScreen } = useNavbar();

  if (isHomeOrLogin) {
    return (
      <div>
        {children}
      </div>
    );
  }

  // Calculate margin and content width based on screen size and navbar state
  const getLayoutStyles = () => {
    if (!isLargeScreen) {
      return {
        marginLeft: '0px',
        maxWidth: '100%',
        width: '100%'
      };
    }
    
    if (isCollapsed) {
      return {
        marginLeft: '80px',
        maxWidth: 'calc(100vw - 80px)',
        width: 'calc(100vw - 80px)'
      };
    }
    
    return {
      marginLeft: '280px',
      maxWidth: 'calc(100vw - 280px)',
      width: 'calc(100vw - 280px)'
    };
  };

  const layoutStyles = getLayoutStyles();

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <div 
        className="transition-all duration-300 ease-in-out"
        style={{
          ...layoutStyles,
          minHeight: '100vh',
          padding: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="w-full h-full flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}


