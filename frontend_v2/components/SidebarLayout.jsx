"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar.jsx";

export default function SidebarLayout({ children }) {
  const pathname = usePathname();
  const isHomeOrLogin = pathname === "/" || pathname?.toLowerCase() === "/login";

  if (isHomeOrLogin) {
    return (
      <div>
        {children}
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="contentWithSidebar">
        {children}
      </div>
    </>
  );
}


