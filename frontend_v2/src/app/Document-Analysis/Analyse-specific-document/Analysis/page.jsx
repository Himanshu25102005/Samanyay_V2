'use client'
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useI18n } from "../../../../../components/I18nProvider.jsx";
import useAppLanguage from "../../../../../components/useAppLanguage.js";
import LanguageSelector from "../../../../../components/LanguageSelector.jsx";

export default function AnalysisPage() {
    const { t } = useI18n();
    const { language } = useAppLanguage();
    
    const [userId] = useState('default_user');
    const [documentId, setDocumentId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [docInfo, setDocInfo] = useState(null);
    const [previewText, setPreviewText] = useState('');
    const fileInputRef = useRef(null);
    
    const [analysis, setAnalysis] = useState(null);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [analysisError, setAnalysisError] = useState(null);
    
    const [question, setQuestion] = useState('');
    const [chat, setChat] = useState([]);
    const [loadingChat, setLoadingChat] = useState(false);
    const [chatError, setChatError] = useState(null);
    
    const [isTranslating, setIsTranslating] = useState(false);
    const [showUploadPanel, setShowUploadPanel] = useState(true);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat]);

    async function handleFileUpload(file) {
        if (!file) return;
        
        setIsUploading(true);
        setUploadError(null);
        setAnalysisError(null);
        setChatError(null);
        
        try {
            const form = new FormData();
            form.append('file', file);
            const url = `/api/analyzer/upload?user_id=${encodeURIComponent(userId)}`;
            
            const res = await fetch(url, { method: 'POST', body: form });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail?.message || `Upload failed: ${res.status}`);
            }
            
            const json = await res.json();
            
            if (json.status === 'success' && json.data?.document_id) {
                setDocumentId(json.data.document_id);
                setPreviewText(json.data.preview || '');
                setDocInfo(json.data.info || null);
                setShowUploadPanel(false);
                await startAnalysis(json.data.document_id);
            } else {
                throw new Error('No document ID received');
            }
        } catch (err) {
            setUploadError(err.message);
        } finally {
            setIsUploading(false);
        }
    }

    async function startAnalysis(docId = documentId) {
        if (!docId) return;
        
        setLoadingAnalysis(true);
        setAnalysisError(null);
        
        try {
            const res = await fetch('/api/analyzer/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ document_id: docId, language, user_id: userId })
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail?.message || 'Analysis failed');
            }
            
            const json = await res.json();
            
            if (json.status === 'success' && json.data?.analysis) {
                setAnalysis(json.data.analysis);
            } else {
                throw new Error('No analysis data received');
            }
        } catch (err) {
            setAnalysisError(err.message);
        } finally {
            setLoadingAnalysis(false);
        }
    }

    async function sendMessage() {
        if (!question.trim() || !documentId) return;
        
        const q = question.trim();
        setQuestion('');
        setChatError(null);
        setChat(prev => [...prev, { role: 'user', content: q, timestamp: new Date() }]);
        
        try {
            setLoadingChat(true);
            const res = await fetch('/api/analyzer/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ document_id: documentId, question: q, language, user_id: userId })
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail?.message || 'Chat failed');
            }
            
            const json = await res.json();
            
            if (json.status === 'success' && json.data?.answer) {
                setChat(prev => [...prev, { role: 'assistant', content: json.data.answer, timestamp: new Date() }]);
            } else {
                throw new Error('No answer received');
            }
        } catch (err) {
            setChatError(err.message);
            setChat(prev => [...prev, { 
                role: 'assistant', 
                content: `Sorry, I encountered an error: ${err.message}`,
                timestamp: new Date() 
            }]);
        } finally {
            setLoadingChat(false);
        }
    }

    function clearSession() {
        setDocumentId(null);
        setDocInfo(null);
        setPreviewText('');
        setAnalysis(null);
        setChat([]);
        setShowUploadPanel(true);
    }

    function downloadText(filename, text) {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    const getSummaryText = () => {
        return analysis?.summary ||
            analysis?.Summary ||
            analysis?.summary_text ||
            analysis?.summaryText ||
            analysis?.document_summary ||
            analysis?.analysis_summary ||
            analysis?.text ||
            analysis?.content ||
            analysis?.result ||
            analysis?.output ||
            (typeof analysis === 'string' ? analysis : 'No summary available');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Floating Upload Panel */}
            <AnimatePresence>
                {showUploadPanel && (
                    <motion.div 
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200"
                    >
                        <div className="max-w-6xl mx-auto px-4 py-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                   <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('uploadDocument')}</h2>
                   <p className="text-xs text-gray-500">{t('fileTypesHint')}</p>
                        </div>

                                <div className="flex gap-3">
                                        <input 
                                            ref={fileInputRef}
                                            type="file" 
                                            accept=".pdf,.doc,.docx,.txt"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileUpload(file);
                                            }}
                                            className="hidden"
                                        />
                                        
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            {isUploading ? (
                                            <span className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                {t('uploading')}
                                            </span>
                                        ) : (
                                            t('chooseDocument')
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                                        
                                        {uploadError && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
                                >
                                    {uploadError}
                                </motion.div>
                            )}
                        </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

            {/* Main Content */}
      <div className={`max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 transition-all duration-300 ${showUploadPanel ? 'pt-28 sm:pt-32' : 'pt-4 sm:pt-6'}`}>
                {/* Header */}
                                        <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
                        <div className="text-center sm:text-left">
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-2">
                                {t('documentAnalysisTitle')}
                            </h1>
                            <p className="text-gray-600">{t('documentAnalysisSubtitle')}</p>
                        </div>
                        <div className="hidden sm:block">
                            <LanguageSelector />
                        </div>
                                            </div>
                                        </motion.div>

                {!documentId ? (
                    /* Empty State */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center min-h-[60vh]"
                    >
                        <div className="text-center">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="mb-6"
                            >
                                <svg className="w-32 h-32 mx-auto text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </motion.div>
               <h3 className="text-2xl font-semibold text-gray-800 mb-2">{t('readyToAnalyze')}</h3>
               <p className="text-gray-500 mb-6">{t('uploadToGetStarted')}</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => fileInputRef.current?.click()}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium shadow-xl hover:shadow-2xl transition-all"
                            >
                 {t('chooseDocument')}
                            </motion.button>
                                </div>
                    </motion.div>
                ) : (
                    /* Main Layout */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 justify-center">
                        {/* Chat Section */}
            <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
               className="flex flex-col min-h-[60vh] md:h-[calc(100vh-200px)]"
                        >
               <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl border border-gray-200 flex flex-col h-full overflow-hidden min-h-0">
                 <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">{t('chatWithAnalyzer')}</h2>
                       <p className="text-xs text-gray-500 mt-0.5">{t('askAnythingAboutDoc')}</p>
                            </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setShowUploadPanel(!showUploadPanel)}
                                            className="p-2 rounded-full hover:bg-white/50 transition-colors"
                                        >
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </motion.button>
                                    </div>
                                </div>

                 <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 min-h-0">
                                    {chat.length === 0 ? (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <div className="text-center">
                                                <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                                <p className="text-sm">{t('startConversationHint')}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {chat.map((message, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[80%] ${message.role === 'user'
                                                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-3xl rounded-br-md'
                                                            : 'bg-gray-100 text-gray-900 rounded-3xl rounded-bl-md'
                                                        } px-5 py-3 shadow-md`}>
                                                        <p className="text-sm leading-relaxed">{message.content}</p>
                                                        <span className={`text-xs mt-1 block ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                                            }`}>
                                                            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                    {loadingChat && (
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                                    className="flex justify-start"
                                                >
                                                    <div className="bg-gray-100 rounded-3xl rounded-bl-md px-5 py-3 shadow-md">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex gap-1">
                                                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-2 h-2 bg-gray-400 rounded-full"></motion.div>
                                                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-gray-400 rounded-full"></motion.div>
                                                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-gray-400 rounded-full"></motion.div>
                                                            </div>
                                                            <span className="text-xs text-gray-500">{t('analyzerThinking')}</span>
                                                        </div>
                                                    </div>
                                        </motion.div>
                                    )}
                                            <div ref={chatEndRef} />
                                        </>
                                    )}
                                </div>

                 <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50">
                   <div className="flex gap-2 sm:gap-3">
                                        <input
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                       placeholder={t('askPlaceholder')}
                       className="flex-1 rounded-full border-2 border-gray-200 px-4 sm:px-5 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-blue-400 transition-colors bg-white"
                                            disabled={loadingChat}
                                        />
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={sendMessage}
                                            disabled={!question.trim() || loadingChat}
                       className="px-5 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Analysis Section */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
               className="flex flex-col min-h-[60vh] md:h-[calc(100vh-200px)]"
                        >
               <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl border border-gray-200 flex flex-col h-full overflow-hidden min-h-0">
                 <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">{t('analysisOfDocument')}</h2>
                       <p className="text-xs text-gray-500 mt-0.5">{t('aiPoweredInsights')}</p>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={clearSession}
                                            className="p-2 rounded-full hover:bg-white/50 transition-colors"
                                        >
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </motion.button>
                                    </div>
                                </div>

                 <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
                                    {loadingAnalysis ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                                    className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
                                                ></motion.div>
                                                <p className="text-gray-600">{t('analyzingDocument')}</p>
                                        </div>
                                    </div>
                                ) : analysisError ? (
                                        <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                                <div className="w-16 h-16 mx-auto mb-4 text-red-400">
                                                <svg fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                                <p className="text-red-600 font-medium mb-4">{analysisError}</p>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                onClick={() => startAnalysis()}
                                                    className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                                >
                                                    {t('retryAnalysis')}
                                                </motion.button>
                                            </div>
                                    </div>
                                ) : analysis ? (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                       className="space-y-3 sm:space-y-4"
                                        >
                       <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100">
                                                <h3 className="text-sm font-bold text-indigo-900 mb-3 uppercase tracking-wide">{t('summary')}</h3>
                                                <p className="text-gray-800 text-sm leading-relaxed mb-4">{getSummaryText()}</p>

                                                <div className="flex gap-2 flex-wrap">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                             onClick={() => navigator.clipboard.writeText(getSummaryText())}
                             className="px-3 sm:px-4 py-2 rounded-full bg-white text-indigo-600 text-xs font-medium shadow-sm hover:shadow-md transition-all"
                                                    >
                                                        {t('copy')}
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                             onClick={() => downloadText('summary.txt', getSummaryText())}
                             className="px-3 sm:px-4 py-2 rounded-full bg-white text-gray-700 text-xs font-medium shadow-sm hover:shadow-md transition-all"
                                                    >
                                                        {t('download')}
                                                    </motion.button>
                                                </div>
                                            </div>

                                            {previewText && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                           className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200"
                                                >
                                                    <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">{t('documentPreview')}</h3>
                           <p className="text-gray-600 text-xs leading-relaxed line-clamp-6">{previewText}</p>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ) : null}
                                    </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Mobile language selector */}
            <div className="sm:hidden fixed bottom-6 left-6 z-50">
                <LanguageSelector />
            </div>
        </div>
    );
}