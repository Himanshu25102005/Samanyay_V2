'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from "../../../components/Navbar.jsx";
import LanguageSelector from "../../../components/LanguageSelector.jsx";
import { useI18n } from "../../../components/I18nProvider.jsx";

export default function DocumentAnalysisPage() {
    const [selected, setSelected] = useState(null);
    const router = useRouter();
    const { t } = useI18n();

    // Professional, subtle animations
    const containerVariants = {
        hidden: { opacity: 0, y: 16 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
                staggerChildren: 0.08,
                when: 'beforeChildren'
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 18, scale: 0.985 },
        show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
        }
    };

    return (
        <>
            <Navbar />
            {/* Main Page Wrapper with left margin for navbar (centered content) */}
            <div className="ml-[280px] min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center">
                <motion.div
                    className="max-w-6xl mx-auto w-full"
                    initial="hidden"
                    animate="show"
                    variants={containerVariants}
                >
                    {/* Page Heading + Language */}
                    <motion.div variants={cardVariants} className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                                {t('documentAnalysis')}
                            </h1>
                            <p className="mt-2 text-gray-600">{t('chooseFeature')}</p>
                        </div>
                        <LanguageSelector />
                    </motion.div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Improve Your Document Card */}
                        <motion.button
                            type="button"
                            variants={cardVariants}
                            whileHover={{ scale: 1.035, boxShadow: '0 12px 30px rgba(30,58,138,0.18)' }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => router.push('/Document-Analysis/Analyse-specific-document')}
                            className="text-left rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gradient-to-br from-white to-blue-50 border border-blue-100 p-6 group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md mb-4 group-hover:from-blue-700 group-hover:to-blue-800 transition-colors">
                                {/* Document icon (inline SVG) */}
                                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14,2 14,8 20,8"/>
                                    <line x1="8" y1="13" x2="16" y2="13"/>
                                    <line x1="8" y1="17" x2="14" y2="17"/>
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">{t('analyseSpecific')}</h2>
                            <p className="mt-2 text-sm text-gray-600">{t('chooseFeature')}</p>
                            <div className="mt-6">
                                <span className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white shadow-sm group-hover:shadow-md">
                                    {t('start')}
                                    <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </span>
                            </div>
                        </motion.button>

                        {/* Chat With Your Document Card */}
                        <motion.button
                            type="button"
                            variants={cardVariants}
                            whileHover={{ scale: 1.035, boxShadow: '0 12px 30px rgba(55,48,163,0.18)' }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => router.push('/Document-Analysis/Chat-with-document')}
                            className="text-left rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gradient-to-br from-white to-blue-50 border border-blue-100 p-6 group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-md mb-4 group-hover:from-indigo-700 group-hover:to-indigo-800 transition-colors">
                                {/* Chat icon (inline SVG) */}
                                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>
                                    <line x1="8" y1="9" x2="16" y2="9"/>
                                    <line x1="8" y1="13" x2="14" y2="13"/>
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">{t('chatWithDoc')}</h2>
                            <p className="mt-2 text-sm text-gray-600">{t('chooseFeature')}</p>
                            <div className="mt-6">
                                <span className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white shadow-sm group-hover:shadow-md">
                                    {t('start')}
                                    <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </span>
                            </div>
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {/* Responsive adjustments for smaller screens (align with navbar) */}
            <style jsx>{`
                @media (max-width: 1024px) {
                    .ml-\[280px\] { margin-left: 80px; }
                }
                @media (max-width: 768px) {
                    .ml-\[280px\] { margin-left: 70px; }
                }
                @media (max-width: 640px) {
                    .ml-\[280px\] { margin-left: 0; padding: 1rem; }
                }
            `}</style>
        </>
    );
}


