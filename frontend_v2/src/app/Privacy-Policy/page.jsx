'use client'

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from "../../../components/LanguageSelector.jsx";
import { useI18n } from "../../../components/I18nProvider.jsx";

export default function PrivacyPolicy() {
    const { t, lang } = useI18n();
    const [scrollProgress, setScrollProgress] = useState(0);
    const [openSections, setOpenSections] = useState({});
    const [openAccordions, setOpenAccordions] = useState({});
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [isTocOpen, setIsTocOpen] = useState(false);
    const sectionRefs = useRef({});

    // Scroll progress tracking
    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
            setScrollProgress(progress);
            setShowBackToTop(scrollTop > 400);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Toggle collapsible sections
    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Toggle accordion items
    const toggleAccordion = (item) => {
        setOpenAccordions(prev => ({ ...prev, [item]: !prev[item] }));
    };

    // Smooth scroll to top
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Scroll to section
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };

    // Professional SVG Icons for sections
    const SectionIcons = {
        collectionA: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
        collectionB: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        purpose: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        sharing: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
        ),
        cookies: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
        ),
        userRights: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        ),
        children: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        security: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        updates: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        identity: (
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
        ),
        secure: (
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        ),
        communication: (
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        investigation: (
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
        cloud: (
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z" />
            </svg>
        ),
        ai: (
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        ),
        auth: (
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
        ),
        payment: (
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
        ),
        email: (
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        clipboard: (
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
        edit: (
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        ),
        delete: (
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        ),
        withdraw: (
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        ),
        shield: (
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        lock: (
            <svg className="w-20 h-20 text-blue-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        ),
        cookie: (
            <svg className="w-10 h-10 text-blue-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
        ),
        warning: (
            <svg className="w-10 h-10 text-blue-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        clock: (
            <svg className="w-8 h-8 text-blue-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        check: (
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
    };

    const tableOfContents = [
        { id: 'overview', label: t('privacyTocOverview') },
        { id: 'definitions', label: t('privacyTocDefinitions') },
        { id: 'collection-a', label: t('privacyTocCollectionA') },
        { id: 'collection-b', label: t('privacyTocCollectionB') },
        { id: 'purpose', label: t('privacyTocPurpose') },
        { id: 'sharing', label: t('privacyTocSharing') },
        { id: 'cookies', label: t('privacyTocCookies') },
        { id: 'user-rights', label: t('privacyTocUserRights') },
        { id: 'children', label: t('privacyTocChildren') },
        { id: 'security', label: t('privacyTocSecurity') },
        { id: 'updates', label: t('privacyTocUpdates') },
        { id: 'terms', label: t('privacyTocTerms') },
    ];

    // Smooth scroll to section for navigation
    const onNavClick = (e, id) => {
        e.preventDefault();
        const el = document.querySelector(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <>
            <div 
                className="min-h-screen bg-gradient-to-br from-slate-50/80 via-blue-50/40 to-slate-100/60 text-slate-900 transition-all duration-300"
                style={{
                    marginLeft: '0px',
                    marginRight: ' 0px',
                    paddingRight: '8px',
                    paddingLeft: '8px',
                    backgroundColor: 'rgba(226, 232, 240, 0.5)',
                }}
            >
                {/* Top Navigation Bar */}
                <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-slate-200/70"
                
            >
                    <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="relative h-8 w-8">
                                <Image src="/logo.png" alt="Samanyay" fill className="object-contain" />
                            </div>
                            <span className="font-semibold text-xl text-[#1A2C4E]">Samanyay</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <motion.button
                                onClick={() => window.location.href = '/'}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center justify-center rounded-lg border border-slate-300/80 bg-white/60 backdrop-blur px-4 py-2 text-sm text-[#1A2C4E] hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 transition-all"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                                {t('home')}
                            </motion.button>
                            <LanguageSelector />
                        </div>
                    </div>
                </header>

                {/* Scroll Progress Bar */}
                <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200/50 z-50">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-500/80 to-sky-400/70 transition-all duration-300"
                        style={{ width: `${scrollProgress}%` }}
                    />
                </div>

                {/* Header Section */}
                <header className="relative bg-gradient-to-br from-slate-50/90 via-blue-50/50 to-slate-100/70 border-b-2 border-slate-200/60">
                    <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-16 pt-8 pb-6 sm:pt-12 sm:pb-8">
                        {/* Breadcrumb */}
                        <nav className="mb-4 animate-fade-in" aria-label="Breadcrumb">
                            <ol className="flex items-center space-x-2 text-sm text-slate-600">
                                <li>
                                    <a href="/" className="hover:text-blue-600 transition-colors">
                                        {t('home')}
                                    </a>
                                </li>
                                <li className="text-slate-400">/</li>
                                <li className="text-slate-800 font-medium">{t('privacyPolicy')}</li>
                            </ol>
                        </nav>

                        {/* Title and Language Selector */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3 animate-slide-up">
                                    {t('privacyPolicy')}
                                </h1>
                                <p className="text-base sm:text-lg text-slate-600 max-w-2xl animate-slide-up-delay">
                                    {t('privacySubtitle')}
                                </p>
                            </div>
                            {/* <div className="animate-fade-in">
                                <LanguageSelector />
                            </div> */}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-16 py-8 sm:py-12">
                    {/* Table of Contents - Right Side Collapsible */}
                    <aside className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 z-30">
                        <AnimatePresence mode="wait">
                            {isTocOpen ? (
                                <motion.nav
                                    key="toc-open"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4 shadow-lg w-56"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold text-slate-800">{t('privacyTableOfContents')}</h3>
                                        <button
                                            onClick={() => setIsTocOpen(false)}
                                            className="text-slate-500 hover:text-slate-700 transition-colors"
                                            aria-label="Close table of contents"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
                                        {tableOfContents.map((item) => (
                                            <li key={item.id}>
                                                <button
                                                    onClick={() => {
                                                        scrollToSection(item.id);
                                                        setIsTocOpen(false);
                                                    }}
                                                    className="text-xs text-slate-600 hover:text-blue-600 transition-colors text-left w-full py-1"
                                                >
                                                    {item.label}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.nav>
                            ) : (
                                <motion.button
                                    key="toc-closed"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    onClick={() => setIsTocOpen(true)}
                                    className="bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-xl p-3 shadow-lg hover:shadow-xl transition-all"
                                    aria-label="Open table of contents"
                                >
                                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </aside>

                    {/* Overview Section */}
                    <section id="overview" className="mb-12 animate-slide-up">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 text-left">{t('introduction')}</h2>
                        <div className="bg-white/90 rounded-xl border-l-4 border-blue-500/60 p-6 sm:p-8 shadow-sm">
                            <p className="text-slate-700 leading-relaxed text-base sm:text-lg text-left">
                                {t('privacyOverview')}
                            </p>
                        </div>
                    </section>

                    {/* Definitions Section */}
                    <section id="definitions" className="mb-12 animate-slide-up-delay">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 text-left">{t('privacyDefinitionsTitle')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { term: 'privacyDefAI', def: 'privacyDefAIDesc' },
                                { term: 'privacyDefCoreServices', def: 'privacyDefCoreServicesDesc' },
                                { term: 'privacyDefAddIn', def: 'privacyDefAddInDesc' },
                                { term: 'privacyDefPaymentGateway', def: 'privacyDefPaymentGatewayDesc' },
                                { term: 'privacyDefProfileInfo', def: 'privacyDefProfileInfoDesc' },
                                { term: 'privacyDefServices', def: 'privacyDefServicesDesc' },
                                { term: 'privacyDefThirdParty', def: 'privacyDefThirdPartyDesc' },
                                { term: 'privacyDefTraining', def: 'privacyDefTrainingDesc' },
                                { term: 'privacyDefUserData', def: 'privacyDefUserDataDesc' },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className={`bg-white/80 rounded-xl p-4 sm:p-6 border border-slate-200/60 hover:border-blue-300/50 hover:shadow-md transition-all duration-300 ${
                                        index % 2 === 0 ? 'md:bg-blue-50/30' : ''
                                    }`}
                                >
                                    <dt className="text-base font-semibold text-slate-900 mb-2 text-left">{t(item.term)}</dt>
                                    <dd className="text-sm text-slate-600 leading-relaxed text-left">{t(item.def)}</dd>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Collection A - Personal Information */}
                    <section id="collection-a" className="mb-12 animate-slide-up-delay">
                        <div className="bg-white/90 rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                            <button
                                onClick={() => toggleSection('collectionA')}
                                className="w-full flex items-center gap-4 justify-between p-6 text-left hover:bg-blue-50/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {SectionIcons.collectionA}
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t('privacyCollectionATitle')}</h2>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-slate-600 transition-transform duration-300 flex-shrink-0 ${
                                        openSections.collectionA ? 'rotate-180' : ''
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-500 ${
                                    openSections.collectionA ? 'max-h-[2000px]' : 'max-h-0'
                                }`}
                            >
                                <div className="px-6 pb-6">
                                    <p className="text-slate-700 mb-4 leading-relaxed text-left">{t('privacyCollectionADesc')}</p>
                                    <ul className="space-y-2 list-disc list-inside text-slate-700 text-left">
                                        <li>{t('privacyCollectionAItem1')}</li>
                                        <li>{t('privacyCollectionAItem2')}</li>
                                        <li>{t('privacyCollectionAItem3')}</li>
                                        <li>{t('privacyCollectionAItem4')}</li>
                                        <li>{t('privacyCollectionAItem5')}</li>
                                        <li>{t('privacyCollectionAItem6')}</li>
                                        <li>{t('privacyCollectionAItem7')}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Collection B - Collected Information */}
                    <section id="collection-b" className="mb-12 animate-slide-up-delay">
                        <div className="bg-white/90 rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                            <button
                                onClick={() => toggleSection('collectionB')}
                                className="w-full flex items-center gap-4 justify-between p-6 text-left hover:bg-blue-50/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {SectionIcons.collectionB}
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t('privacyCollectionBTitle')}</h2>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-slate-600 transition-transform duration-300 flex-shrink-0 ${
                                        openSections.collectionB ? 'rotate-180' : ''
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-500 ${
                                    openSections.collectionB ? 'max-h-[1000px]' : 'max-h-0'
                                }`}
                            >
                                <div className="px-6 pb-6">
                                    <p className="text-slate-700 leading-relaxed text-left">{t('privacyCollectionBDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Purpose & Privacy Guarantee Section */}
                    <section id="purpose" className="mb-12 animate-slide-up-delay">
                        <div className="bg-gradient-to-br from-blue-50/60 to-slate-50/50 rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                {SectionIcons.purpose}
                                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('privacyPurposeTitle')}</h2>
                            </div>
                            <p className="text-slate-700 mb-6 leading-relaxed text-left">{t('privacyPurposeDesc')}</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                {[
                                    { icon: SectionIcons.identity, text: 'privacyPurposeIdentity' },
                                    { icon: SectionIcons.secure, text: 'privacyPurposeSecurity' },
                                    { icon: SectionIcons.communication, text: 'privacyPurposeCommunication' },
                                    { icon: SectionIcons.investigation, text: 'privacyPurposeInvestigation' },
                                ].map((item, index) => (
                                    <div key={index} className="flex items-start gap-3 bg-white/70 rounded-lg p-4">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {item.icon}
                                        </div>
                                        <p className="text-slate-700 text-sm text-left">{t(item.text)}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Core Privacy Guarantee Callout */}
                            <div className="bg-white/90 rounded-xl p-6 border-2 border-blue-200/50 shadow-md">
                                <h3 className="text-xl font-bold text-slate-900 mb-4 text-left">{t('privacyGuaranteeTitle')}</h3>
                                <ul className="space-y-3 text-slate-700">
                                    {[
                                        'privacyGuarantee1',
                                        'privacyGuarantee2',
                                        'privacyGuarantee3',
                                        'privacyGuarantee4',
                                        'privacyGuarantee5',
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start gap-3 text-left">
                                            <span className="flex-shrink-0 mt-0.5">
                                                {SectionIcons.check}
                                            </span>
                                            <span>{t(item)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Data Sharing Section */}
                    <section id="sharing" className="mb-12 animate-slide-up-delay">
                        <div className="flex items-center gap-4 mb-6">
                            {SectionIcons.sharing}
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('privacySharingTitle')}</h2>
                        </div>
                        <p className="text-slate-700 mb-6 leading-relaxed text-left">{t('privacySharingDesc')}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { category: 'privacySharingCloud', purpose: 'privacySharingCloudDesc', icon: SectionIcons.cloud },
                                { category: 'privacySharingAI', purpose: 'privacySharingAIDesc', icon: SectionIcons.ai },
                                { category: 'privacySharingAuth', purpose: 'privacySharingAuthDesc', icon: SectionIcons.auth },
                                { category: 'privacySharingPayment', purpose: 'privacySharingPaymentDesc', icon: SectionIcons.payment },
                                { category: 'privacySharingEmail', purpose: 'privacySharingEmailDesc', icon: SectionIcons.email },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white/80 rounded-xl p-5 border border-slate-200/60 hover:border-blue-300/50 hover:shadow-md transition-all duration-300 animate-fade-in"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="mb-3 flex items-center justify-center w-16 h-16 bg-blue-50/50 rounded-lg">
                                        {item.icon}
                                    </div>
                                    <h3 className="font-semibold text-slate-900 mb-2 text-left">{t(item.category)}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed text-left">{t(item.purpose)}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Cookie Policy Section */}
                    <section id="cookies" className="mb-12 animate-slide-up-delay">
                        <div className="bg-white/90 rounded-xl border border-slate-200/60 p-6 sm:p-8 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    {SectionIcons.cookie}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 text-left">{t('privacyCookiesTitle')}</h2>
                                    <p className="text-slate-700 leading-relaxed text-left">{t('privacyCookiesDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* User Rights Section - Accordion */}
                    <section id="user-rights" className="mb-12 animate-slide-up-delay">
                        <div className="flex items-center gap-4 mb-6">
                            {SectionIcons.userRights}
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('privacyUserRightsTitle')}</h2>
                        </div>
                        <p className="text-slate-700 mb-6 leading-relaxed text-left">{t('privacyUserRightsDesc')}</p>
                        
                        <div className="space-y-4">
                            {[
                                { id: 'right1', title: 'privacyRight1Title', desc: 'privacyRight1Desc', icon: SectionIcons.clipboard },
                                { id: 'right2', title: 'privacyRight2Title', desc: 'privacyRight2Desc', icon: SectionIcons.edit },
                                { id: 'right3', title: 'privacyRight3Title', desc: 'privacyRight3Desc', icon: SectionIcons.delete },
                                { id: 'right4', title: 'privacyRight4Title', desc: 'privacyRight4Desc', icon: SectionIcons.withdraw },
                            ].map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white/90 rounded-xl border border-slate-200/60 overflow-hidden hover:border-blue-300/50 transition-colors"
                                >
                                    <button
                                        onClick={() => toggleAccordion(item.id)}
                                        className="w-full flex items-center justify-between p-5 text-left hover:bg-blue-50/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.icon}
                                            <h3 className="text-lg font-semibold text-slate-900">{t(item.title)}</h3>
                                        </div>
                                        <svg
                                            className={`w-5 h-5 text-slate-600 transition-transform duration-300 flex-shrink-0 ${
                                                openAccordions[item.id] ? 'rotate-180' : ''
                                            }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    <div
                                        className={`overflow-hidden transition-all duration-500 ${
                                            openAccordions[item.id] ? 'max-h-[500px]' : 'max-h-0'
                                        }`}
                                    >
                                        <div className="px-5 pb-5">
                                            <p className="text-slate-700 leading-relaxed text-left">{t(item.desc)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-5 bg-blue-50/50 rounded-xl border border-blue-200/50">
                            <p className="text-slate-700 mb-2 text-left">
                                {t('privacyUserRightsContact')}{' '}
                                <a href="mailto:privacy@samanyay.com" className="text-blue-600 hover:underline font-medium">
                                    privacy@samanyay.com
                                </a>
                            </p>
                        </div>
                    </section>

                    {/* Children's Privacy Section */}
                    <section id="children" className="mb-12 animate-slide-up-delay">
                        <div className="bg-blue-50/40 rounded-xl border-2 border-blue-200/50 p-6 sm:p-8 text-center">
                            <div className="flex justify-center mb-4">
                                {SectionIcons.warning}
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">{t('privacyChildrenTitle')}</h2>
                            <p className="text-slate-700 leading-relaxed max-w-2xl mx-auto text-left">{t('privacyChildrenDesc')}</p>
                        </div>
                    </section>

                    {/* Data Protection & Security Section */}
                    <section id="security" className="mb-12 animate-slide-up-delay">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    {SectionIcons.security}
                                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('privacySecurityTitle')}</h2>
                                </div>
                                <p className="text-slate-700 mb-6 leading-relaxed text-left">{t('privacySecurityDesc')}</p>
                                <ul className="space-y-3">
                                    {[
                                        'privacySecurityItem1',
                                        'privacySecurityItem2',
                                        'privacySecurityItem3',
                                        'privacySecurityItem4',
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start gap-3 text-left">
                                            <span className="flex-shrink-0 mt-0.5">
                                                {SectionIcons.shield}
                                            </span>
                                            <span className="text-slate-700">{t(item)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex items-center justify-center">
                                {SectionIcons.lock}
                            </div>
                        </div>
                    </section>

                    {/* Policy Updates Section */}
                    <section id="updates" className="mb-12 animate-slide-up-delay">
                        <div className="bg-white/90 rounded-xl border border-slate-200/60 p-6 sm:p-8 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    {SectionIcons.clock}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 text-left">{t('privacyUpdatesTitle')}</h2>
                                    <p className="text-slate-700 italic leading-relaxed text-left">{t('privacyUpdatesDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* User Terms & Conditions Section */}
                    <section id="terms" className="mb-12 animate-slide-up-delay">
                        <div className="bg-slate-100/60 rounded-xl border border-slate-300/50 p-6 sm:p-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 text-left">{t('privacyTermsTitle')}</h2>
                            
                            <div className="space-y-6 bg-white/80 rounded-lg p-6">
                                {[
                                    { title: 'privacyTermsAcceptance', desc: 'privacyTermsAcceptanceDesc' },
                                    { title: 'privacyTermsResponsibilities', desc: 'privacyTermsResponsibilitiesDesc' },
                                    { title: 'privacyTermsServices', desc: 'privacyTermsServicesDesc' },
                                    { title: 'privacyTermsIP', desc: 'privacyTermsIPDesc' },
                                    { title: 'privacyTermsDisclaimer', desc: 'privacyTermsDisclaimerDesc' },
                                    { title: 'privacyTermsLiability', desc: 'privacyTermsLiabilityDesc' },
                                    { title: 'privacyTermsIndemnification', desc: 'privacyTermsIndemnificationDesc' },
                                    { title: 'privacyTermsGoverning', desc: 'privacyTermsGoverningDesc' },
                                    { title: 'privacyTermsModifications', desc: 'privacyTermsModificationsDesc' },
                                ].map((item, index) => (
                                    <div key={index} className="border-b border-slate-200/60 pb-6 last:border-0 last:pb-0">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2 text-left">{t(item.title)}</h3>
                                        <p className="text-slate-700 leading-relaxed text-left">{t(item.desc)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer - Same as Home Page */}
                <footer className="bg-[#051066] text-white mt-16">
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
                                    href="https://samanyay-v2.vercel.app/#features"
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    /* onClick={(e) => onNavClick(e, "#features")} */
                                >Features</motion.a>
                                <motion.a 
                                    className="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60 focus:ring-offset-[#0818A8] rounded transition-all duration-300 hover:text-white hover:scale-105" 
                                    href="/Privacy-Policy"
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

                {/* Back to Top Button */}
                {showBackToTop && (
                    <button
                        onClick={scrollToTop}
                        className="fixed bottom-8 bg-blue-600/90 text-white p-3 rounded-full shadow-lg hover:bg-blue-700/90 transition-all duration-300 z-50 animate-fade-in"
                        style={{ right: '40px' }}
                        aria-label={t('backToTop')}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </button>
                )}
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-up {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
                .animate-slide-up {
                    animation: slide-up 0.6s ease-out;
                }
                .animate-slide-up-delay {
                    animation: slide-up 0.6s ease-out 0.2s both;
                }
            `}</style>
        </>
    );
}
