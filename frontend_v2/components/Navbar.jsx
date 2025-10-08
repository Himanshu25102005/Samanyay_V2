'use client'
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useI18n, getFontClass } from './I18nProvider.jsx';
import styles from './Navbar.module.css';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { t, lang } = useI18n();

    const deriveActiveSection = (path) => {
        if (!path) return 'home';
        if (path === '/' || path === '/page') return 'home';
        if (path.startsWith('/profile')) return 'dashboard';
        if (path.startsWith('/Legal-Research')) return 'legal-research';
        if (path.startsWith('/Drafting-Assistant')) return 'drafting-assistant';
        if (path.startsWith('/Document-Analysis')) return 'document-analysis';
        return 'home';
    };

    const [activeSection, setActiveSection] = useState(() => deriveActiveSection(pathname));
    const [isMounted, setIsMounted] = useState(false);

    // Handle navigation clicks
    const handleNavigation = (section) => {
        setActiveSection(section);
        // Route to proper pages
        if (section === 'home') router.push('/');
        else if (section === 'dashboard') router.push('/profile');
        else if (section === 'legal-research') router.push('/Legal-Research');
        else if (section === 'drafting-assistant') router.push('/Drafting-Assistant');
        else if (section === 'document-analysis') router.push('/Document-Analysis');
    };

    // Handle logout
    const handleLogout = () => {
        // Add logout logic here
        console.log('Logout clicked');
    };

    // Set active based on current pathname
    useEffect(() => {
        setActiveSection(deriveActiveSection(pathname));
    }, [pathname]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <nav className={`${styles.navbar} ${getFontClass(lang)}`} role="navigation" aria-label="Main navigation">
            {/* Brand/Logo Area */}
            <div className={styles.brand}>
                <div className={styles.logo}>
                    {/* Logo placeholder - add your logo here */}
                    <div className={styles.logoPlaceholder}>
                        <img src="https://cdn-icons-png.flaticon.com/512/1/1430.png" alt="" />
                    </div>
                    <span>Samanyay AI</span>
                </div>
            </div>

            {/* Navigation Menu */}
            <ul className={styles.navList} role="menubar">
                <li role="none">
                    <button
                        className={`${styles.navButton} ${isMounted && activeSection === 'home' ? styles.active : ''}`}
                        onClick={() => handleNavigation('home')}
                        role="menuitem"
                        aria-label="Navigate to Home"
                        tabIndex="0"
                    >
                        <svg 
                            className={styles.navIcon} 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M3 11l9-7 9 7"/>
                            <path d="M9 22V12h6v10"/>
                            <path d="M21 22H3"/>
                        </svg>
                        <span className={styles.navText}>{t('home')}</span>
                    </button>
                </li>
                <li role="none">
                    <button
                        className={`${styles.navButton} ${isMounted && activeSection === 'dashboard' ? styles.active : ''}`}
                        onClick={() => handleNavigation('dashboard')}
                        role="menuitem"
                        aria-label="Navigate to Profile"
                        tabIndex="0"
                    >
                        <svg 
                            className={styles.navIcon} 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="8" r="4"/>
                            <path d="M6 20a6 6 0 0 1 12 0"/>
                        </svg>
                        <span className={styles.navText}>{t('dashboard')}</span>
                    </button>
                </li>
                
                <li role="none">
                    <button
                        className={`${styles.navButton} ${isMounted && activeSection === 'legal-research' ? styles.active : ''}`}
                        onClick={() => handleNavigation('legal-research')}
                        role="menuitem"
                        aria-label="Navigate to Legal Research"
                        tabIndex="0"
                    >
                        <svg 
                            className={styles.navIcon} 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                            <path d="M8 7h8"/>
                            <path d="M8 11h8"/>
                            <path d="M8 15h5"/>
                            <circle cx="16" cy="6" r="2"/>
                            <path d="M14 8l2-2"/>
                        </svg>
                        <span className={styles.navText}>{t('legalResearch')}</span>
                    </button>
                </li>
                
                <li role="none">
                    <button
                        className={`${styles.navButton} ${isMounted && activeSection === 'drafting-assistant' ? styles.active : ''}`}
                        onClick={() => handleNavigation('drafting-assistant')}
                        role="menuitem"
                        aria-label="Navigate to Drafting Assistant"
                        tabIndex="0"
                    >
                        <img 
                            className={styles.navIcon} 
                            src="https://static.thenounproject.com/png/565256-200.png" 
                            alt="Drafting Assistant Icon" 
                        />
                        <span className={styles.navText}>{t('draftingAssistant')}</span>
                    </button>
                </li>
                
                <li role="none">
                    <button
                        className={`${styles.navButton} ${isMounted && activeSection === 'document-analysis' ? styles.active : ''}`}
                        onClick={() => handleNavigation('document-analysis')}
                        role="menuitem"
                        aria-label="Navigate to Document Analysis"
                        tabIndex="0"
                    >
                        <svg 
                            className={styles.navIcon} 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10,9 9,9 8,9"/>
                            <circle cx="18" cy="15" r="3"/>
                            <path d="m21 18-1.5-1.5"/>
                        </svg>
                        <span className={styles.navText}>{t('documentAnalysis')}</span>
                    </button>
                </li>
            </ul>

            {/* Footer Section with Logout */}
            <div className={styles.footer}>
                <button
                    className={styles.logoutButton}
                    onClick={handleLogout}
                    aria-label="Logout from application"
                    tabIndex="0"
                >
                    <svg 
                        className={styles.logoutIcon} 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16,17 21,12 16,7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    <span className={styles.logoutText}>{t('logout')}</span>
                </button>
            </div>
        </nav>
    );
}