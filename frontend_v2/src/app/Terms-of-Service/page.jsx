'use client'

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from "../../../components/LanguageSelector.jsx";
import { useI18n } from "../../../components/I18nProvider.jsx";

export default function TermsAndConditions() {
    const { t, lang } = useI18n();
    const [scrollProgress, setScrollProgress] = useState(0);
    const [openSections, setOpenSections] = useState({});
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
        services: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        disclaimer: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        license: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
        ),
        prohibitions: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
        ),
        solicitation: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        ip: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        discontinuation: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        indemnification: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        termination: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        general: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        changes: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        ),
    };

    const tableOfContents = [
        { id: 'overview', label: t('termsTocOverview') },
        { id: 'services', label: t('termsTocServices') },
        { id: 'disclaimer', label: t('termsTocDisclaimer') },
        { id: 'license', label: t('termsTocLicense') },
        { id: 'prohibitions', label: t('termsTocProhibitions') },
        { id: 'solicitation', label: t('termsTocSolicitation') },
        { id: 'ip', label: t('termsTocIP') },
        { id: 'discontinuation', label: t('termsTocDiscontinuation') },
        { id: 'indemnification', label: t('termsTocIndemnification') },
        { id: 'termination', label: t('termsTocTermination') },
        { id: 'general', label: t('termsTocGeneral') },
        { id: 'changes', label: t('termsTocChanges') },
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
                    marginRight: '0px',
                    paddingRight: '10px',
                    paddingLeft: '10px',
                    backgroundColor: 'rgba(226, 232, 240, 0.5)',
                }}
            >
                {/* Top Navigation Bar */}
                <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-slate-200/70">
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
                                <li className="text-slate-800 font-medium">{t('termsOfService')}</li>
                            </ol>
                        </nav>

                        {/* Title */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3 animate-slide-up">
                                    {t('termsTitle')}
                                </h1>
                                <p className="text-base sm:text-lg text-slate-600 max-w-2xl animate-slide-up-delay">
                                    {t('termsSubtitle')}
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
                                        <h3 className="text-sm font-semibold text-slate-800">{t('termsTableOfContents')}</h3>
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
                        <div className="bg-white/90 rounded-xl border-l-4 border-blue-500/60 p-6 sm:p-8 shadow-sm">
                            <p className="text-slate-700 leading-relaxed text-base sm:text-lg text-left">
                                {t('termsOverview')}
                            </p>
                        </div>
                    </section>

                    {/* Services Section */}
                    <section id="services" className="mb-12 animate-slide-up-delay">
                        <div className="bg-white/90 rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                            <button
                                onClick={() => toggleSection('services')}
                                className="w-full flex items-center gap-4 justify-between p-6 text-left hover:bg-blue-50/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {SectionIcons.services}
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t('termsServicesTitle')}</h2>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-slate-600 transition-transform duration-300 flex-shrink-0 ${
                                        openSections.services ? 'rotate-180' : ''
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
                                    openSections.services ? 'max-h-[2000px]' : 'max-h-0'
                                }`}
                            >
                                <div className="px-6 pb-6">
                                    <p className="text-slate-700 mb-4 leading-relaxed text-left">{t('termsServicesDesc')}</p>
                                    <ul className="space-y-3 text-slate-700 text-left">
                                        <li className="flex items-start gap-3">
                                            <span className="text-blue-600 mt-1">•</span>
                                            <span>{t('termsServicesItem1')}</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-blue-600 mt-1">•</span>
                                            <span>{t('termsServicesItem2')}</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-blue-600 mt-1">•</span>
                                            <span>{t('termsServicesItem3')}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Disclaimer Section */}
                    <section id="disclaimer" className="mb-12 animate-slide-up-delay">
                        <div className="bg-white/90 rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                            <button
                                onClick={() => toggleSection('disclaimer')}
                                className="w-full flex items-center gap-4 justify-between p-6 text-left hover:bg-blue-50/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {SectionIcons.disclaimer}
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t('termsDisclaimerTitle')}</h2>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-slate-600 transition-transform duration-300 flex-shrink-0 ${
                                        openSections.disclaimer ? 'rotate-180' : ''
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
                                    openSections.disclaimer ? 'max-h-[3000px]' : 'max-h-0'
                                }`}
                            >
                                <div className="px-6 pb-6">
                                    <p className="text-slate-700 mb-4 leading-relaxed text-left">{t('termsDisclaimerDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* License Section */}
                    <section id="license" className="mb-12 animate-slide-up-delay">
                        <div className="bg-white/90 rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                            <button
                                onClick={() => toggleSection('license')}
                                className="w-full flex items-center gap-4 justify-between p-6 text-left hover:bg-blue-50/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {SectionIcons.license}
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t('termsLicenseTitle')}</h2>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-slate-600 transition-transform duration-300 flex-shrink-0 ${
                                        openSections.license ? 'rotate-180' : ''
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
                                    openSections.license ? 'max-h-[2000px]' : 'max-h-0'
                                }`}
                            >
                                <div className="px-6 pb-6">
                                    <p className="text-slate-700 leading-relaxed text-left">{t('termsLicenseDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Prohibitions Section */}
                    <section id="prohibitions" className="mb-12 animate-slide-up-delay">
                        <div className="bg-white/90 rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                            <button
                                onClick={() => toggleSection('prohibitions')}
                                className="w-full flex items-center gap-4 justify-between p-6 text-left hover:bg-blue-50/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {SectionIcons.prohibitions}
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t('termsProhibitionsTitle')}</h2>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-slate-600 transition-transform duration-300 flex-shrink-0 ${
                                        openSections.prohibitions ? 'rotate-180' : ''
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
                                    openSections.prohibitions ? 'max-h-[4000px]' : 'max-h-0'
                                }`}
                            >
                                <div className="px-6 pb-6">
                                    <p className="text-slate-700 mb-4 leading-relaxed text-left">{t('termsProhibitionsDesc')}</p>
                                    <ul className="space-y-3 text-slate-700 text-left">
                                        {[
                                            'termsProhibitionsItem1', 'termsProhibitionsItem2', 'termsProhibitionsItem3',
                                            'termsProhibitionsItem4', 'termsProhibitionsItem5', 'termsProhibitionsItem6',
                                            'termsProhibitionsItem7', 'termsProhibitionsItem8', 'termsProhibitionsItem9',
                                            'termsProhibitionsItem10', 'termsProhibitionsItem11', 'termsProhibitionsItem12',
                                            'termsProhibitionsItem13', 'termsProhibitionsItem14'
                                        ].map((item, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <span className="text-blue-600 mt-1">•</span>
                                                <span>{t(item)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Solicitation Section */}
                    <section id="solicitation" className="mb-12 animate-slide-up-delay">
                        <div className="bg-white/90 rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                            <button
                                onClick={() => toggleSection('solicitation')}
                                className="w-full flex items-center gap-4 justify-between p-6 text-left hover:bg-blue-50/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {SectionIcons.solicitation}
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t('termsSolicitationTitle')}</h2>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-slate-600 transition-transform duration-300 flex-shrink-0 ${
                                        openSections.solicitation ? 'rotate-180' : ''
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
                                    openSections.solicitation ? 'max-h-[1000px]' : 'max-h-0'
                                }`}
                            >
                                <div className="px-6 pb-6">
                                    <p className="text-slate-700 leading-relaxed text-left">{t('termsSolicitationDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* IP Section */}
                    <section id="ip" className="mb-12 animate-slide-up-delay">
                        <div className="bg-white/90 rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                            <button
                                onClick={() => toggleSection('ip')}
                                className="w-full flex items-center gap-4 justify-between p-6 text-left hover:bg-blue-50/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {SectionIcons.ip}
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t('termsIPTitle')}</h2>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-slate-600 transition-transform duration-300 flex-shrink-0 ${
                                        openSections.ip ? 'rotate-180' : ''
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
                                    openSections.ip ? 'max-h-[2000px]' : 'max-h-0'
                                }`}
                            >
                                <div className="px-6 pb-6">
                                    <p className="text-slate-700 leading-relaxed text-left">{t('termsIPDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Discontinuation Section */}
                    <section id="discontinuation" className="mb-12 animate-slide-up-delay">
                        <div className="bg-white/90 rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                            <button
                                onClick={() => toggleSection('discontinuation')}
                                className="w-full flex items-center gap-4 justify-between p-6 text-left hover:bg-blue-50/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {SectionIcons.discontinuation}
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t('termsDiscontinuationTitle')}</h2>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-slate-600 transition-transform duration-300 flex-shrink-0 ${
                                        openSections.discontinuation ? 'rotate-180' : ''
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
                                    openSections.discontinuation ? 'max-h-[1000px]' : 'max-h-0'
                                }`}
                            >
                                <div className="px-6 pb-6">
                                    <p className="text-slate-700 leading-relaxed text-left">{t('termsDiscontinuationDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Indemnification Section */}
                    <section id="indemnification" className="mb-12 animate-slide-up-delay">
                        <div className="bg-white/90 rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                            <button
                                onClick={() => toggleSection('indemnification')}
                                className="w-full flex items-center gap-4 justify-between p-6 text-left hover:bg-blue-50/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {SectionIcons.indemnification}
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t('termsIndemnificationTitle')}</h2>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-slate-600 transition-transform duration-300 flex-shrink-0 ${
                                        openSections.indemnification ? 'rotate-180' : ''
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
                                    openSections.indemnification ? 'max-h-[2000px]' : 'max-h-0'
                                }`}
                            >
                                <div className="px-6 pb-6">
                                    <p className="text-slate-700 leading-relaxed text-left">{t('termsIndemnificationDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Termination Section */}
                    <section id="termination" className="mb-12 animate-slide-up-delay">
                        <div className="bg-white/90 rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                            <button
                                onClick={() => toggleSection('termination')}
                                className="w-full flex items-center gap-4 justify-between p-6 text-left hover:bg-blue-50/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {SectionIcons.termination}
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t('termsTerminationTitle')}</h2>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-slate-600 transition-transform duration-300 flex-shrink-0 ${
                                        openSections.termination ? 'rotate-180' : ''
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
                                    openSections.termination ? 'max-h-[2000px]' : 'max-h-0'
                                }`}
                            >
                                <div className="px-6 pb-6">
                                    <p className="text-slate-700 leading-relaxed text-left">{t('termsTerminationDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* General Terms Section */}
                    <section id="general" className="mb-12 animate-slide-up-delay">
                        <div className="bg-gradient-to-br from-blue-50/60 to-slate-50/50 rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                {SectionIcons.general}
                                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('termsGeneralTitle')}</h2>
                            </div>
                            <div className="space-y-6 bg-white/70 rounded-lg p-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2 text-left">{t('termsGeneralForceMajeure')}</h3>
                                    <p className="text-slate-700 leading-relaxed text-left">{t('termsGeneralForceMajeureDesc')}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2 text-left">{t('termsGeneralNotices')}</h3>
                                    <p className="text-slate-700 leading-relaxed text-left">{t('termsGeneralNoticesDesc')}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2 text-left">{t('termsGeneralJurisdiction')}</h3>
                                    <p className="text-slate-700 leading-relaxed text-left">{t('termsGeneralJurisdictionDesc')}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2 text-left">{t('termsGeneralEntireAgreement')}</h3>
                                    <p className="text-slate-700 leading-relaxed text-left">{t('termsGeneralEntireAgreementDesc')}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2 text-left">{t('termsGeneralWaiver')}</h3>
                                    <p className="text-slate-700 leading-relaxed text-left">{t('termsGeneralWaiverDesc')}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2 text-left">{t('termsGeneralSeverability')}</h3>
                                    <p className="text-slate-700 leading-relaxed text-left">{t('termsGeneralSeverabilityDesc')}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2 text-left">{t('termsGeneralAssignment')}</h3>
                                    <p className="text-slate-700 leading-relaxed text-left">{t('termsGeneralAssignmentDesc')}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2 text-left">{t('termsGeneralIndependent')}</h3>
                                    <p className="text-slate-700 leading-relaxed text-left">{t('termsGeneralIndependentDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Changes Section */}
                    <section id="changes" className="mb-12 animate-slide-up-delay">
                        <div className="bg-white/90 rounded-xl border border-slate-200/60 p-6 sm:p-8 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    {SectionIcons.changes}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 text-left">{t('termsChangesTitle')}</h2>
                                    <p className="text-slate-700 leading-relaxed text-left">{t('termsChangesDesc')}</p>
                                </div>
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
                                {/* <motion.a 
                                    className="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60 focus:ring-offset-[#0818A8] rounded transition-all duration-300 hover:text-white hover:scale-105" 
                                    href="#features"
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => onNavClick(e, "#features")}
                                >Features</motion.a> */}
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
                                    href="/Terms-and-Conditions"
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
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

