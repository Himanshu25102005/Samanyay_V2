"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Playfair_Display, Inter } from "next/font/google";
import Plasma from "../../animations/Plasma";
import { createPortal } from "react-dom";
import { useUser } from "../components/UserContext";
import { useRouter } from "next/navigation";
import { API } from "../lib/api";


const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroParallax = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const { user, loading: userLoading, clearUser } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await API.logout();
      // Clear user state immediately
      if (clearUser) {
        clearUser();
      }
      // Redirect and refresh
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user state and redirect even on error
      if (clearUser) {
        clearUser();
      }
      window.location.href = '/';
    }
  };

  const testimonials = useMemo(
    () => [
      { name: "Aarav Sharma", role: "Advocate, Delhi HC", text: "Samanyay saves me hours every week. Its research and drafting assistance are remarkably precise." },
      { name: "Neha Verma", role: "In-house Counsel", text: "Clean, trustworthy, and fast. The AI insights help us move confidently." },
      { name: "Rahul Mehta", role: "Startup Founder", text: "From notices to agreements, Samanyay makes legal tasks approachable and efficient." },
      { name: "Priya Singh", role: "Legal Analyst", text: "Multilingual support and smart summarization are game-changers for our workflows." },
    ],
    []
  );

  const [activeIdx, setActiveIdx] = useState(0);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ left: '0', right: 'auto', top: '100%' });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on scroll or click outside
  useEffect(() => {
    const handleScroll = () => {
      if (isFeaturesOpen) {
        setIsFeaturesOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      if (isFeaturesOpen && 
          buttonRef.current && 
          !buttonRef.current.contains(event.target) &&
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target)) {
        setIsFeaturesOpen(false);
      }
    };

    if (isFeaturesOpen) {
      document.addEventListener('scroll', handleScroll, true);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFeaturesOpen]);

  useEffect(() => {
    const id = setInterval(() => setActiveIdx((i) => (i + 1) % testimonials.length), 4500);
    return () => clearInterval(id);
  }, [testimonials.length]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Get button position if available
      const button = buttonRef.current || document.querySelector('[aria-haspopup="menu"]');
      if (button) {
        const rect = button.getBoundingClientRect();
        const spaceBelow = height - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = 200; // Approximate dropdown height
        
        // Special handling for the problematic range 769px to 1160px
        if (width >= 769 && width <= 1160) {
          // For this range, always position below but ensure it doesn't get clipped
          const maxBottom = height - 20; // 20px margin from bottom
          const calculatedBottom = rect.bottom + dropdownHeight;
          
          if (calculatedBottom > maxBottom) {
            // Position above if it would be clipped below
            setDropdownPosition({ 
              left: '0', 
              right: 'auto', 
              top: 'auto',
              bottom: '100%',
              marginTop: '0',
              marginBottom: '0.5rem'
            });
          } else {
            // Position below with proper spacing
            setDropdownPosition({ 
              left: '0', 
              right: 'auto', 
              top: '100%',
              bottom: 'auto',
              marginTop: '0.5rem',
              marginBottom: '0'
            });
          }
        } else if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          // Position above the button for other ranges
          setDropdownPosition({ 
            left: '0', 
            right: 'auto', 
            top: 'auto',
            bottom: '100%',
            marginTop: '0',
            marginBottom: '0.5rem'
          });
        } else {
          // Position below the button for other ranges
          setDropdownPosition({ 
            left: '0', 
            right: 'auto', 
            top: '100%',
            bottom: 'auto',
            marginTop: '0.5rem',
            marginBottom: '0'
          });
        }
      } else {
        setDropdownPosition({ left: '0', right: 'auto', top: '100%' });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFeaturesOpen]);

  function onNavClick(e, id) {
    e.preventDefault();
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Portal-based dropdown component
  const DropdownPortal = () => {
    if (!mounted || !isFeaturesOpen || !buttonRef.current) return null;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const dropdownHeight = Math.min(360, viewportHeight - 48); // up to 360px or fit screen
    const dropdownWidth = 256; // 16rem = 256px

    // Calculate position
    let top = buttonRect.bottom + 8;
    let left = buttonRect.left;
    let right = 'auto';

    // Check if dropdown would be clipped on the right
    if (left + dropdownWidth > viewportWidth - 16) {
      left = 'auto';
      right = viewportWidth - buttonRect.right;
    }

    // Check if dropdown would be clipped at the bottom
    if (top + dropdownHeight > viewportHeight - 16) {
      top = buttonRect.top - dropdownHeight - 8;
    }

    return createPortal(
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 6 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        role="menu"
        ref={dropdownRef}
        className="fixed z-[9999] w-64 overflow-hidden rounded-xl border border-slate-200/70 bg-white/90 backdrop-blur shadow-[0_20px_50px_rgba(26,44,78,0.15)]"
        style={{
          top: `${top}px`,
          left: left === 'auto' ? 'auto' : `${left}px`,
          right: right === 'auto' ? 'auto' : `${right}px`,
          maxHeight: `${dropdownHeight}px`,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          boxShadow: '0 10px 32px rgba(26,44,78,0.19)'
        }}
        tabIndex={0}
        aria-label="Feature Navigation Dropdown"
        onMouseEnter={() => setIsFeaturesOpen(true)}
        onMouseLeave={() => setIsFeaturesOpen(false)}
      >
        <a href="https://backendv2-for-dep-production.up.railway.app/api/legal-research" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50" role="menuitem" onClick={() => setIsFeaturesOpen(false)}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 ring-1 ring-blue-200">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 5h18M6 8h12M8 11h8M10 14h4" stroke="#0818A8" strokeWidth="1.6" />
              <circle cx="12" cy="18" r="3" stroke="#1A2C4E" strokeWidth="1.6" />
            </svg>
          </span>
          <div>
            <div className="font-medium text-[#1A2C4E]">Legal Research</div>
            <div className="text-xs text-slate-500">Smart search across jurisprudence</div>
          </div>
        </a>
        <a href="https://backendv2-for-dep-production.up.railway.app/api/Drafting-Assistant" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50" role="menuitem" onClick={() => setIsFeaturesOpen(false)}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 ring-1 ring-blue-200">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 20h16M7 16l10-10 2 2-10 10H7v-2z" stroke="#0818A8" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <div className="font-medium text-[#1A2C4E]">Drafting Assistant</div>
            <div className="text-xs text-slate-500">Create and refine legal drafts</div>
          </div>
        </a>
        <a href="https://backendv2-for-dep-production.up.railway.app/api/Document-Analysis" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50" role="menuitem" onClick={() => setIsFeaturesOpen(false)}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 ring-1 ring-blue-200">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M7 3h7l4 4v11a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z" stroke="#1A2C4E" strokeWidth="1.6" />
              <path d="M12 10h4M12 14h4M8 10h2M8 14h2" stroke="#0818A8" strokeWidth="1.6" />
            </svg>
          </span>
          <div>
            <div className="font-medium text-[#1A2C4E]">Document Analyser</div>
            <div className="text-xs text-slate-500">Summaries, risks, and insights</div>
          </div>
        </a>
        <a href="https://backendv2-for-dep-production.up.railway.app/api/Case-Management" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50" role="menuitem" onClick={() => setIsFeaturesOpen(false)}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 ring-1 ring-blue-200">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#1A2C4E" strokeWidth="1.6" />
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="#0818A8" strokeWidth="1.6" />
            </svg>
          </span>
          <div>
            <div className="font-medium text-[#1A2C4E]">Case Management</div>
            <div className="text-xs text-slate-500">Organize and track legal cases</div>
          </div>
        </a>
      </motion.div>,
      document.body
    );
  };

  return (
    <main className={`${inter.variable} ${playfair.variable} text-slate-800`}>
      {/* In-page navbar */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-slate-200/70">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <Image src="/logo.png" alt="Samanyay" fill className="object-contain" />
            </div>
            <span className="font-semibold text-xl text-[#1A2C4E]">Samanyay</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-md text-slate-700">
            {[{ id: "#features", label: "Features" }, { id: "#how-it-works", label: "How it works" }, { id: "#benefits", label: "Why Samanyay" }, { id: "#trust", label: "Security" }, { id: "#contact", label: "Contact" }].map((link) => (
              <motion.a
                key={link.id}
                href={link.id}
                onClick={(e) => onNavClick(e, link.id)}
                whileTap={{ scale: 0.96 }}
                className="hover:text-[#1A2C4E] transition"
              >
                {link.label}
              </motion.a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            {userLoading ? (
              <div className="w-8 h-8 border-2 border-slate-300 border-t-[#0818A8] rounded-full animate-spin"></div>
            ) : user ? (
              <>
                <motion.button
                  onClick={() => router.push('/profile')}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center rounded-full w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 transition-all"
                  aria-label="Profile"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0818A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </motion.button>
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300/80 bg-white/60 backdrop-blur px-4 py-2 text-sm text-[#1A2C4E] hover:bg-red-50 hover:border-red-300 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-300 transition-all"
                  aria-label="Logout"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <motion.a
                  href="/login"
                  whileHover={{ y: -2, boxShadow: "0 10px 24px rgba(8,24,168,0.22)" }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300/80 bg-white/60 backdrop-blur px-4 py-2 text-sm text-[#1A2C4E] hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300"
                >
                  Sign In
                </motion.a>
                <motion.a
                  href="/login"
                  whileHover={{ y: -2, boxShadow: "0 12px 28px rgba(8,24,168,0.28)", filter: "brightness(1.05)" }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center rounded-lg bg-[#0818A8] px-4 py-2 text-sm text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0818A8]"
                >
                  Get Started
                </motion.a>
              </>
            )}
          </div>
        </div>
      </header>
      {/* Background */}
      <div className="fixed inset-0 -z-20" aria-hidden>
        <Plasma 
          color="#2EA27E"
          speed={0.5}
          direction="forward"
          scale={1.2}
          opacity={0.35}
          mouseInteractive={true}
        />
      </div>

      <div className="fixed inset-0 -z-10 bg-[radial-gradient(1200px_800px_at_10%_10%,#E8ECF2_20%,transparent_60%),linear-gradient(to_bottom,#F9FAFB, #E8ECF2)]" />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14 py-20 md:py-24 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="[font-family:var(--font-playfair)] text-[#1A2C4E] text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight"
              >
                AI-Powered Legal Assistance for Everyone
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
                className="mt-4 md:mt-5 text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl"
              >
                Simplifying legal processes with intelligent document analysis and legal research.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
                className="mt-7 flex flex-wrap items-center gap-3"
                style={{ overflow: 'visible' }}
              >
                <motion.a
                  href="/login"
                  className="relative inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#0818A8] via-[#0A1BB8] to-[#0C1EC8] shadow-[0_10px_24px_rgba(8,24,168,0.35)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0818A8]"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
                  whileHover={{ scale: 1.03, boxShadow: "0 16px 40px rgba(8,24,168,0.45)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">Get Started</span>
                  <span aria-hidden className="absolute inset-0 rounded-2xl bg-white/10 mix-blend-overlay" />
                </motion.a>

                <div className="relative z-50" style={{ overflow: 'visible' }}>
                  <button
                    ref={buttonRef}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-300/80 bg-white/70 px-5 py-3 text-sm text-[#1A2C4E] backdrop-blur hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 transition"
                    aria-haspopup="menu"
                    aria-expanded={isFeaturesOpen}
                    onClick={() => {
                      const newState = !isFeaturesOpen;
                      setIsFeaturesOpen(newState);
                      if (newState) {
                        // Recalculate position when opening
                        setTimeout(() => {
                          const button = buttonRef.current;
                          if (button) {
                            const rect = button.getBoundingClientRect();
                            const height = window.innerHeight;
                            const width = window.innerWidth;
                            const spaceBelow = height - rect.bottom;
                            const spaceAbove = rect.top;
                            const dropdownHeight = 200;
                            
                            // Special handling for the problematic range 769px to 1160px
                            if (width >= 769 && width <= 1160) {
                              const maxBottom = height - 20; // 20px margin from bottom
                              const calculatedBottom = rect.bottom + dropdownHeight;
                              
                              if (calculatedBottom > maxBottom) {
                                setDropdownPosition({ 
                                  left: '0', 
                                  right: 'auto', 
                                  top: 'auto',
                                  bottom: '100%',
                                  marginTop: '0',
                                  marginBottom: '0.5rem'
                                });
                              } else {
                                setDropdownPosition({ 
                                  left: '0', 
                                  right: 'auto', 
                                  top: '100%',
                                  bottom: 'auto',
                                  marginTop: '0.5rem',
                                  marginBottom: '0'
                                });
                              }
                            } else if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                              setDropdownPosition({ 
                                left: '0', 
                                right: 'auto', 
                                top: 'auto',
                                bottom: '100%',
                                marginTop: '0',
                                marginBottom: '0.5rem'
                              });
                            } else {
                              setDropdownPosition({ 
                                left: '0', 
                                right: 'auto', 
                                top: '100%',
                                bottom: 'auto',
                                marginTop: '0.5rem',
                                marginBottom: '0'
                              });
                            }
                          }
                        }, 10);
                      }
                    }}
                  >
                    Our Features
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M6 9l6 6 6-6" stroke="#1A2C4E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                </div>
              </motion.div>
            </div>

            <div className="relative">
              {/* Glow */}
              <motion.div
                style={{ y: heroParallax }}
                aria-hidden
                className="absolute -top-10 -left-10 right-0 h-80 rounded-3xl bg-gradient-to-br from-[#1A2C4E]/10 via-[#0818A8]/10 to-transparent blur-2xl"
              />
              {/* Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                className="relative rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur p-4 shadow-[0_10px_40px_rgba(26,44,78,0.08)]"
              >
                <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl">
                  <Image src="/window12.jpg" alt="AI legal assistant" fill priority className="object-cover rounded-2xl" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-12 md:py-20">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="[font-family:var(--font-playfair)] text-2xl md:text-3xl lg:text-4xl text-[#1A2C4E]"
          >
            Powerful Features at Your Fingertips
          </motion.h2>
          <p className="mt-3 text-slate-600 max-w-2xl">A modern toolkit balancing legal rigor with AI efficiency.</p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Features with Explore option - First row */}
            <div className="md:col-span-2 xl:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[
              {
                title: "Document Analysis & Summarization",
                name: "Document Analyser",
                desc: "Understand lengthy documents in seconds.",
                href: "https://backendv2-for-dep-production.up.railway.app/api/Document-Analysis",
                points: [
                  "Upload PDFs, DOCX, or images",
                  "Instant summaries and key clauses",
                  "Risk flags and obligations",
                ],
                svg: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M7 3h7l4 4v11a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z" stroke="#1A2C4E" strokeWidth="1.6" />
                    <path d="M12 10h4M12 14h4M8 10h2M8 14h2" stroke="#0818A8" strokeWidth="1.6" />
                  </svg>
                )
              },
              {
                title: "AI-Driven Legal Research",
                name: "Legal Research",
                desc: "Search jurisprudence and insights intelligently.",
                href: "https://backendv2-for-dep-production.up.railway.app/api/legal-research",
                points: [
                  "Cite cases with paragraphs",
                  "Jurisdiction and year filters",
                  "Export references",
                ],
                svg: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="11" cy="11" r="7" stroke="#1A2C4E" strokeWidth="1.6" />
                    <path d="M21 21l-4.3-4.3" stroke="#0818A8" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                )
              },
              {
                title: "Custom Document Generation",
                name: "Drafting Assistant",
                desc: "Draft contracts, notices, and more.",
                href: "https://backendv2-for-dep-production.up.railway.app/api/Drafting-Assistant",
                points: [
                  "Templates + prompts",
                  "Voice-to-draft",
                  "Download DOCX",
                ],
                svg: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M4 20h16M7 16l10-10 2 2-10 10H7v-2z" stroke="#1A2C4E" strokeWidth="1.6" strokeLinejoin="round" />
                  </svg>
                )
              },
              {
                title: "Comprehensive Case Management",
                name: "Case Management",
                desc: "Organize and track legal cases efficiently.",
                href: "https://backendv2-for-dep-production.up.railway.app/api/Case-Management",
                points: [
                  "Client case tracking",
                  "Task management",
                  "Document organization",
                ],
                svg: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#1A2C4E" strokeWidth="1.6" />
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="#0818A8" strokeWidth="1.6" />
                  </svg>
                )
              },
            ].map((f, i) => {
              const Card = (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  whileHover={{ y: -4, boxShadow: "0 24px 60px rgba(26,44,78,0.14)" }}
                  className={`group h-full rounded-3xl border border-slate-200/70 bg-gradient-to-br from-indigo-50/40 to-purple-50/30 backdrop-blur p-7 md:p-8 shadow-[0_10px_40px_rgba(26,44,78,0.08)] transition-all duration-300 will-change-transform ${f.href ? "ring-1 ring-transparent hover:ring-[#0818A8]/30 cursor-pointer hover:shadow-[0_20px_60px_rgba(8,24,168,0.15)]" : ""}`}
                >
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A2C4E]/10 to-[#0818A8]/10 flex items-center justify-center ring-1 ring-slate-200 group-hover:scale-110 transition-transform duration-300">
                      {f.svg}
                    </div>
                    {f.name && (
                      <div className="text-base font-bold text-[#0818A8] group-hover:text-[#0A1BB8] transition-colors duration-300">
                        {f.name.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="text-lg md:text-xl font-semibold text-[#1A2C4E] group-hover:text-[#0818A8] transition-colors duration-300">{f.title}</div>
                  <div className="text-sm md:text-base text-slate-600 mt-2">{f.desc}</div>
                  {Array.isArray(f.points) && (
                    <ul className="mt-4 space-y-2 text-sm text-slate-700">
                      {f.points.map((p, pointIndex) => (
                        <li key={p} className="flex items-start gap-2 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: `${pointIndex * 50}ms` }}>
                          <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#0818A8]/30 bg-[#0818A8]/10 text-[#0818A8] group-hover:scale-110 transition-transform duration-300">✓</span>
                          <span className="group-hover:text-slate-800 transition-colors duration-300">{p}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {f.href && (
                    <div className="mt-6">
                      <span className="inline-flex items-center gap-2 rounded-xl bg-[#0818A8] px-4 py-2 text-sm text-white group-hover:bg-[#0A1BB8] group-hover:scale-105 transition-all duration-300">Explore
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M5 12h14M13 5l7 7-7 7" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  )}
                </motion.div>
              );
              return f.href ? (
                <a key={f.title} href={f.href} aria-label={f.title} className="block h-full">
                  {Card}
                </a>
              ) : (
                <div key={f.title} className="h-full">{Card}</div>
              );
            })}
            </div>
            
            {/* Features without Explore option - Second row */}
            <div className="md:col-span-2 xl:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
            {[
              { 
                title: "Multilingual Support", 
                desc: "Work across languages with ease.", 
                points: ["Translate drafts", "Localize clauses"], 
                svg: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <text x="12" y="18" textAnchor="middle" fontSize="16" fontFamily="serif" fill="#0818A8" fontWeight="bold">अ</text>
                  </svg>
                ) 
              },
              { 
                title: "Secure & Private Assistance", 
                desc: "Your data stays confidential.", 
                points: ["Encrypted in transit & at rest", "No data selling"], 
                svg: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M7 10V7a5 5 0 0 1 10 0v3" stroke="#1A2C4E" strokeWidth="1.6" />
                    <rect x="4" y="10" width="16" height="10" rx="2" stroke="#0818A8" strokeWidth="1.6" />
                    <circle cx="12" cy="15" r="2" stroke="#1A2C4E" strokeWidth="1.6" />
                  </svg>
                ) 
              },
            ].map((f, i) => {
              const Card = (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  whileHover={{ y: -4, boxShadow: "0 24px 60px rgba(26,44,78,0.14)" }}
                  className="group h-full rounded-3xl border border-slate-200/70 bg-gradient-to-br from-indigo-50/40 to-purple-50/30 backdrop-blur p-7 md:p-8 shadow-[0_10px_40px_rgba(26,44,78,0.08)] transition-all duration-300 will-change-transform hover:shadow-[0_20px_60px_rgba(8,24,168,0.15)]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A2C4E]/10 to-[#0818A8]/10 flex items-center justify-center ring-1 ring-slate-200 group-hover:scale-110 transition-transform duration-300">
                    {f.svg}
                  </div>
                  <div className="mt-4 text-lg md:text-xl font-semibold text-[#1A2C4E] group-hover:text-[#0818A8] transition-colors duration-300">{f.title}</div>
                  <div className="text-sm md:text-base text-slate-600 mt-2">{f.desc}</div>
                  {Array.isArray(f.points) && (
                    <ul className="mt-4 space-y-2 text-sm text-slate-700">
                      {f.points.map((p, pointIndex) => (
                        <li key={p} className="flex items-start gap-2 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: `${pointIndex * 50}ms` }}>
                          <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#0818A8]/30 bg-[#0818A8]/10 text-[#0818A8] group-hover:scale-110 transition-transform duration-300">✓</span>
                          <span className="group-hover:text-slate-800 transition-colors duration-300">{p}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              );
              return <div key={f.title} className="h-full">{Card}</div>;
            })}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 md:py-20">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="[font-family:var(--font-playfair)] text-2xl md:text-3xl lg:text-4xl text-[#1A2C4E]"
          >
            How Samanyay Works
          </motion.h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Upload Document", desc: "Securely upload PDFs or text files.", delay: 0 },
              { title: "AI Analyzes & Suggests Insights", desc: "Get summaries, risks, and recommendations.", delay: 0.05 },
              { title: "Get Instant Results & Drafts", desc: "Copy, export, or start a new draft.", delay: 0.1 },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: s.delay }}
                whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(26,44,78,0.12)" }}
                className="relative rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur p-6 shadow-sm"
              >
                <div className="absolute top-4 right-4 text-sm text-slate-400">{String(i + 1).padStart(2, "0")}</div>
                <div className="font-medium text-[#1A2C4E]">{s.title}</div>
                <div className="text-sm text-slate-600 mt-1">{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-12 md:py-20">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="[font-family:var(--font-playfair)] text-2xl md:text-3xl lg:text-4xl text-[#1A2C4E]"
            >
              Why Choose Samanyay
            </motion.h2>
            <p className="mt-3 text-slate-600 leading-relaxed max-w-prose">
              Built for professionals and citizens alike, Samanyay brings clarity and efficiency to legal work.
            </p>
            <ul className="mt-6 space-y-3">
              {["Accessible legal help anytime, anywhere", "Save time and reduce legal costs", "AI-powered insights trusted by professionals"].map(
                (b) => (
                    <li key={b} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-blue-500/40 bg-blue-50 text-blue-700">✓</span>
                    <span className="text-slate-700">{b}</span>
                  </li>
                )
              )}
            </ul>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur p-6 shadow-[0_10px_40px_rgba(26,44,78,0.08)]"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-gradient-to-br from-[#1A2C4E]/10 to-[#2EA27E]/10 flex items-center justify-center ring-1 ring-slate-200">
                <Image src="/globe.svg" alt="AI" width={28} height={28} />
              </div>
    <div>
                <div className="font-medium text-[#1A2C4E]">Designed with AI precision</div>
                <div className="text-sm text-slate-600">Premium UX, tasteful motion, and accessibility in mind.</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section aria-label="Testimonials" className="py-12 md:py-20 bg-white/50">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="[font-family:var(--font-playfair)] text-2xl md:text-3xl lg:text-4xl text-[#1A2C4E]"
          >
            Trusted by Professionals and Citizens
          </motion.h2>
          <div className="relative mt-8">
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                  <motion.figure
                    key={t.name}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: activeIdx === i ? 1 : 0.4, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-slate-200" />
                      <figcaption>
                        <div className="font-medium text-[#1A2C4E]">{t.name}</div>
                        <div className="text-sm text-slate-600">{t.role}</div>
                      </figcaption>
                    </div>
                    <blockquote className="mt-4 text-slate-700 leading-relaxed">“{t.text}”</blockquote>
                  </motion.figure>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section id="trust" className="py-12 md:py-20">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14">
          <div className="relative">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="[font-family:var(--font-playfair)] text-2xl md:text-3xl lg:text-4xl text-[#1A2C4E]"
            >
              Your Privacy, Our Priority
            </motion.h2>
            <div className="absolute left-0 -bottom-1 h-[2px] w-40 bg-gradient-to-r from-[#0818A8] to-transparent" />
    </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "End-to-End Document Encryption", desc: "Your files are protected in transit and at rest.", svg: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M7 10V7a5 5 0 0 1 10 0v3" stroke="#1A2C4E" strokeWidth="1.6" />
                    <rect x="4" y="10" width="16" height="10" rx="2" stroke="#0818A8" strokeWidth="1.6" />
                    <circle cx="12" cy="15" r="2" stroke="#1A2C4E" strokeWidth="1.6" />
                  </svg>
                )
              },
              {
                title: "Strict Confidentiality Policies", desc: "We never sell or share your data.", svg: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z" stroke="#1A2C4E" strokeWidth="1.6" />
                    <path d="M9 12l2 2 4-4" stroke="#0818A8" strokeWidth="1.6" />
                  </svg>
                )
              },
              /* {
                title: "GDPR-Compliant Data Handling", desc: "Built with global privacy standards.", svg: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="9" stroke="#1A2C4E" strokeWidth="1.6" />
                    <path d="M7 12h10M12 7v10" stroke="#2EA27E" strokeWidth="1.6" />
                  </svg>
                )
              }, */
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur p-6 shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A2C4E]/10 to-[#0818A8]/10 mb-3 flex items-center justify-center">
                  {c.svg}
                </div>
                <div className="font-medium text-[#1A2C4E]">{c.title}</div>
                <div className="text-sm text-slate-600 mt-1">{c.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#051066] text-white">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8">
                <Image src="/logo.png" alt="Samanyay" fill className="object-contain" />
              </div>
              <span className="text-lg font-semibold">Samanyay</span>
            </div>
            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-100/90">
              <motion.a 
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60 focus:ring-offset-[#0818A8] rounded transition-all duration-300 hover:text-white hover:scale-105" 
                href="#about"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => onNavClick(e, "#about")}
              >About</motion.a>
              <motion.a 
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60 focus:ring-offset-[#0818A8] rounded transition-all duration-300 hover:text-white hover:scale-105" 
                href="#features"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => onNavClick(e, "#features")}
              >Features</motion.a>
              <motion.a 
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60 focus:ring-offset-[#0818A8] rounded transition-all duration-300 hover:text-white hover:scale-105" 
                href="https://samanyay-v2.vercel.app/Privacy-Policy"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >Privacy Policy</motion.a>
              <motion.a 
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60 focus:ring-offset-[#0818A8] rounded transition-all duration-300 hover:text-white hover:scale-105" 
                href="#contact"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => onNavClick(e, "#contact")}
              >Contact</motion.a>
              <motion.a 
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60 focus:ring-offset-[#0818A8] rounded transition-all duration-300 hover:text-white hover:scale-105" 
                href="#terms"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => onNavClick(e, "#terms")}
              >Terms of Service</motion.a>
            </nav>
            <div className="flex items-center gap-3">
              <motion.a 
                aria-label="Twitter" 
                href="https://twitter.com/" 
                target="_blank" 
                rel="noreferrer" 
                className="size-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60 focus:ring-offset-[#0818A8] transition-all duration-300"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white" aria-hidden>
                  <path d="M22 5.8c-.7.3-1.5.6-2.3.7.8-.5 1.4-1.2 1.7-2-.8.5-1.7.9-2.6 1.1A4.1 4.1 0 0 0 12 8.9c0 .3 0 .6.1.9-3.3-.2-6.3-1.7-8.3-4-.3.6-.5 1.2-.5 1.9 0 1.4.7 2.7 1.9 3.4-.6 0-1.2-.2-1.7-.5 0 2 1.4 3.7 3.3 4-.3.1-.7.2-1 .2-.3 0-.5 0-.8-.1.6 1.7 2.2 2.9 4.1 3a8.3 8.3 0 0 1-5.1 1.7H3a11.7 11.7 0 0 0 6.3 1.8c7.6 0 11.8-6.3 11.8-11.8v-.5c.8-.6 1.4-1.2 1.9-2z" />
                </svg>
              </motion.a>
              <motion.a 
                aria-label="Instagram" 
                href="https://instagram.com/" 
                target="_blank" 
                rel="noreferrer" 
                className="size-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60 focus:ring-offset-[#0818A8] transition-all duration-300"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white" aria-hidden>
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5.8-2.2a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
                </svg>
              </motion.a>
              <motion.a 
                aria-label="LinkedIn" 
                href="https://www.linkedin.com/" 
                target="_blank" 
                rel="noreferrer" 
                className="size-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60 focus:ring-offset-[#0818A8] transition-all duration-300"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white" aria-hidden>
                  <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v16H0V8zm7.5 0h4.8v2.2h.1c.7-1.3 2.4-2.7 4.9-2.7 5.2 0 6.1 3.4 6.1 7.8V24h-5V16.4c0-1.8 0-4.1-2.5-4.1-2.6 0-3 2-3 4v7.7h-5V8z" />
                </svg>
              </motion.a>
            </div>
          </div>
          {/* Contact in footer */}
          <div id="contact" className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-300"
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-sm text-slate-100/90">Email</div>
              <a href="mailto:aditya@samanyay.com" className="mt-1 block text-white font-medium hover:underline transition-colors duration-300">aditya@samanyay.com</a>
            </motion.div>
            <motion.div 
              className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-300"
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-sm text-slate-100/90">Phone</div>
              <a href="tel:+919665170418" className="mt-1 block text-white font-medium hover:underline transition-colors duration-300">+91-9665170418</a>
            </motion.div>
            <motion.div 
              className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-300"
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-sm text-slate-100/90">Location</div>
              <div className="mt-1 text-white font-medium">Pune, Maharashtra</div>
            </motion.div>
          </div>
          <div className="mt-8 text-xs text-slate-200/80">© {new Date().getFullYear()} Samanyay. All rights reserved.</div>
        </div>
      </footer>
      
      {/* Portal-based dropdown */}
      <DropdownPortal />
    </main>
  );
}
