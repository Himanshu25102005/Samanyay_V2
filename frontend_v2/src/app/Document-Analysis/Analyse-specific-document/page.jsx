'use client'
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from "../../../../components/Navbar.jsx";

export default function AnalyseSpecificDocument() {
    const router = useRouter();
    const [health, setHealth] = useState('unknown');
    const [language, setLanguage] = useState('English');

    useEffect(() => {
        // Health check
        fetch('/api/analyzer/health')
            .then(r => r.json())
            .then(data => {
                console.log('Analyzer health:', data);
                setHealth(data?.status || 'unknown');
            })
            .catch(err => {
                console.error('Health check failed:', err);
                setHealth('unreachable');
            });
    }, []);

    const card = (key, title, description, gradient, icon) => (
        <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`rounded-3xl shadow-lg hover:shadow-2xl border p-8 bg-gradient-to-br ${gradient} transition-all min-h-[280px] flex flex-col cursor-pointer`}
            onClick={() => router.push('/Document-Analysis/Analyse-specific-document/Analysis')}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/70 backdrop-blur flex items-center justify-center text-2xl">
                    {icon}
                </div>
                <span className={`px-2.5 py-1 rounded text-xs ${health === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {health}
                </span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
            <p className="text-base text-gray-700 mt-2 leading-relaxed flex-1">{description}</p>
            <div className="mt-6">
                <div className="w-full justify-center inline-flex items-center gap-2 px-5 py-3 text-base font-medium rounded-xl bg-blue-600 text-white shadow hover:bg-blue-700 transition-colors">
                    <span>Start Analysis</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </motion.div>
    );

    return (
        <>
            <Navbar />
            <div className="ml-[280px] min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center">
                <div className="max-w-6xl mx-auto w-full">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                                Analyse Specific Document
                            </h1>
                            <p className="text-gray-600 mt-1 text-base">Select the document type and upload to continue.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Language</label>
                            <select value={language} onChange={(e)=>setLanguage(e.target.value)} className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>English</option>
                                <option>Hindi</option>
                                <option>Gujarati</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {card(
                            'chargesheet',
                            'Chargesheet Analyser',
                            'Upload a chargesheet to begin automated legal insights and drafting support.',
                            'from-white to-blue-50 border-blue-100',
                            <span>🧾</span>
                        )}
                        {card(
                            'contract',
                            'Contract Analyser',
                            'Upload a contract to analyze key clauses, risks, and obligations.',
                            'from-white to-indigo-50 border-indigo-100',
                            <span>📃</span>
                        )}
                        {card(
                            'case',
                            'Case Analyser',
                            'Upload case documents to summarize, extract issues and prepare notes.',
                            'from-white to-teal-50 border-teal-100',
                            <span>📂</span>
                        )}
                        {card(
                            'timeline',
                            'Timeline Generator',
                            'Upload legal documents to automatically generate chronological timelines and event sequences.',
                            'from-white to-purple-50 border-purple-100',
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {/* Timeline line */}
                                <path d="M3 12h18" strokeWidth="2" strokeLinecap="round"/>
                                {/* Timeline events */}
                                <circle cx="6" cy="12" r="2" fill="currentColor"/>
                                <circle cx="12" cy="12" r="2" fill="currentColor"/>
                                <circle cx="18" cy="12" r="2" fill="currentColor"/>
                                {/* Arrow indicating progression */}
                                <path d="M20 10l2 2-2 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                {/* Calendar/clock elements */}
                                <rect x="2" y="4" width="4" height="3" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                                <rect x="10" y="4" width="4" height="3" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                                <rect x="18" y="4" width="4" height="3" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                            </svg>
                        )}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }}
                            whileHover={{ y: -4, scale: 1.02 }}
                            className={`rounded-3xl shadow-lg hover:shadow-2xl border p-8 bg-gradient-to-br from-white to-amber-50 border-amber-100 transition-all min-h-[280px] flex flex-col cursor-pointer`}
                            onClick={() => router.push('/Document-Analysis/Analyse-specific-document/Analysis')}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-12 h-12 rounded-xl bg-white/70 backdrop-blur flex items-center justify-center text-2xl">
                                    <span>💬</span>
                                </div>
                                <span className={`px-2.5 py-1 rounded text-xs ${health === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{health}</span>
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900">General Document</h2>
                            <p className="text-base text-gray-700 mt-2 leading-relaxed flex-1">Provide a specific query and upload any document to get targeted insights.</p>

                            <div className="mt-6">
                                <div className="w-full justify-center inline-flex items-center gap-2 px-5 py-3 text-base font-medium rounded-xl bg-blue-600 text-white shadow hover:bg-blue-700 transition-colors">
                                    <span>Start Analysis</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media (max-width: 1024px) { .ml-\[280px\] { margin-left: 80px; } }
                @media (max-width: 768px) { .ml-\[280px\] { margin-left: 70px; } }
                @media (max-width: 640px) { .ml-\[280px\] { margin-left: 0; padding: 1rem; } }
            `}</style>
        </>
    );
}


