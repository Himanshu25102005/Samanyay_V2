'use client'
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from "../../../../../components/Navbar.jsx";
import LanguageSelector from "../../../../../components/LanguageSelector.jsx";
import useAppLanguage from "../../../../../components/useAppLanguage.js";

export default function AnalysisPage() {
    const router = useRouter();
    const { language, setLanguage } = useAppLanguage();
    
    // User ID - in a real app, this would come from authentication
    const [userId] = useState('default_user');
    
    // Document upload states
    const [documentId, setDocumentId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [uploadError, setUploadError] = useState(null);
    const [docInfo, setDocInfo] = useState(null);
    const [previewText, setPreviewText] = useState('');
    const fileInputRef = useRef(null);
    
    // Analysis states
    const [analysis, setAnalysis] = useState(null);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [analysisError, setAnalysisError] = useState(null);
    
    // Chat states
    const [question, setQuestion] = useState('');
    const [chat, setChat] = useState([]);
    const [loadingChat, setLoadingChat] = useState(false);
    const [chatError, setChatError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Translation states
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationError, setTranslationError] = useState(null);

    // Check for existing document from session storage
    useEffect(() => {
        const id = sessionStorage.getItem('document_id');
        const storedLanguage = sessionStorage.getItem('language');
        const storedUserId = sessionStorage.getItem('user_id');
        
        // Only restore if we have all required data and it's from the same session
        if (id && storedLanguage && storedUserId === userId) {
            setDocumentId(id);
            try {
                const info = sessionStorage.getItem('document_info');
                if (info) setDocInfo(JSON.parse(info));
                
                const preview = sessionStorage.getItem('document_preview');
                if (preview) setPreviewText(preview);
            } catch (error) {
                console.error('Error restoring session data:', error);
                // Clear invalid session data
                clearSession();
            }
        } else if (id) {
            // Clear old session data if user_id doesn't match
            clearSession();
        }
    }, [userId]);

    // Clear session storage
    function clearSession() {
        sessionStorage.removeItem('document_id');
        sessionStorage.removeItem('document_info');
        sessionStorage.removeItem('document_preview');
        sessionStorage.removeItem('language');
        sessionStorage.removeItem('user_id');
        setDocumentId(null);
        setDocInfo(null);
        setPreviewText('');
        setAnalysis(null);
        setChat([]);
    }

    // Upload document function
    async function handleFileUpload(file) {
        if (!file) return;
        
        setIsUploading(true);
        setUploadStatus('uploading');
        setUploadError(null);
        setAnalysisError(null);
        setChatError(null);
        
        try {
            const form = new FormData();
            form.append('file', file);
            
            // Add user_id as query parameter
            const url = `/api/analyzer/upload?user_id=${encodeURIComponent(userId)}`;
            
            const res = await fetch(url, { 
                method: 'POST', 
                body: form 
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail?.message || `Upload failed: ${res.status} ${res.statusText}`);
            }
            
            const json = await res.json();
            console.log('Upload API Response:', json);
            
            if (json.status === 'success' && json.data?.document_id) {
                const newDocumentId = json.data.document_id;
                console.log('Document ID received:', newDocumentId);
                console.log('Document info:', json.data.info);
                setDocumentId(newDocumentId);
                setUploadStatus('success');
                setPreviewText(json.data.preview || '');
                setDocInfo(json.data.info || null);
                
                // Store in session storage
                sessionStorage.setItem('document_id', newDocumentId);
                sessionStorage.setItem('language', language);
                sessionStorage.setItem('user_id', userId);
                
                try {
                    sessionStorage.setItem('document_preview', json.data.preview || '');
                    sessionStorage.setItem('document_info', JSON.stringify(json.data.info || {}));
                } catch {}
                
                // Automatically start analysis
                await startAnalysis(newDocumentId);
            } else {
                throw new Error(json.detail?.message || 'No document ID received from server');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setUploadError(err.message);
            setUploadStatus('error');
        } finally {
            setIsUploading(false);
        }
    }

    // Start analysis function
    async function startAnalysis(docId = documentId) {
        if (!docId) return;
        
        setLoadingAnalysis(true);
        setAnalysisError(null);
        
        try {
            const requestBody = {
                document_id: docId,
                language: language,
                user_id: userId
            };
            
            const res = await fetch('/api/analyzer/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail?.message || `Analysis failed: ${res.status} ${res.statusText}`);
            }
            
            const json = await res.json();
            console.log('Analysis API Response:', json);
            
            if (json.status === 'success' && json.data?.analysis) {
                console.log('Analysis data structure:', json.data.analysis);
                setAnalysis(json.data.analysis);
            } else {
                console.error('Analysis failed - response structure:', json);
                throw new Error(json.detail?.message || 'Analysis failed - no data received');
            }
        } catch (err) {
            console.error('Analysis error:', err);
            setAnalysisError(err.message);
        } finally {
            setLoadingAnalysis(false);
        }
    }

    // Send chat message
    async function sendMessage() {
        if (!question.trim() || !documentId) return;
        
        const q = question.trim();
        setQuestion('');
        setChatError(null);
        setChat(prev => [...prev, { role: 'user', content: q, timestamp: new Date() }]);
        
        try {
            setLoadingChat(true);
            const requestBody = {
                document_id: documentId,
                question: q,
                language: language,
                user_id: userId
            };
            
            const res = await fetch('/api/analyzer/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail?.message || `Chat failed: ${res.status} ${res.statusText}`);
            }
            
            const json = await res.json();
            
            if (json.status === 'success' && json.data?.answer) {
                const answer = json.data.answer;
                setChat(prev => [...prev, { role: 'assistant', content: answer, timestamp: new Date() }]);
            } else {
                throw new Error(json.detail?.message || 'No answer received from server');
            }
        } catch (err) {
            console.error('Chat error:', err);
            setChatError(err.message);
            setChat(prev => [...prev, { 
                role: 'assistant', 
                content: `Sorry, I encountered an error: ${err.message}. Please try again.`, 
                timestamp: new Date() 
            }]);
        } finally {
            setLoadingChat(false);
        }
    }

    // Translation function
    async function translateText(text, targetLanguage) {
        if (!text || !targetLanguage) return text;
        
        setIsTranslating(true);
        setTranslationError(null);
        
        try {
            const requestBody = {
                text: text,
                target_language: targetLanguage
            };
            
            const res = await fetch('/api/analyzer/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail?.message || `Translation failed: ${res.status} ${res.statusText}`);
            }
            
            const json = await res.json();
            
            if (json.status === 'success' && json.data?.translated_text) {
                return json.data.translated_text;
            } else {
                throw new Error(json.detail?.message || 'Translation failed - no data received');
            }
        } catch (err) {
            console.error('Translation error:', err);
            setTranslationError(err.message);
            return text; // Return original text if translation fails
        } finally {
            setIsTranslating(false);
        }
    }

    // Download text function
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

    return (
        <>
            <Navbar />
            <div className="lg:ml-[270px] md:ml-[100px] sm:ml-20 ml-20 ] h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 overflow-hidden">
                <div className="max-w-7xl mx-auto h-full flex flex-col">
                    {/* Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 sm:mb-8"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                                    Document Analysis
                                </h1>
                                <p className="text-gray-600 mt-1">Upload and analyze your legal documents</p>
                            </div>
                            <LanguageSelector />
                        </div>
                    </motion.div>


                    {/* Main Content - Two Section Layout with Fixed Height */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
                        {/* Left Section - Upload and Chat Stacked */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex flex-col space-y-4 h-full"
                        >
                            {/* Upload Section - Fixed Height */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-48 flex-shrink-0">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Upload Document</h2>
                                    
                                    <div className="flex gap-2">
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
                                        
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                    <span>Choose Document</span>
                                                </>
                                            )}
                                        </button>
                                        
                                        {documentId && (
                                            <button
                                                onClick={clearSession}
                                                className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                <span>Clear</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    {/* Upload Status - Only show loading and errors */}
                                    <AnimatePresence>
                                        {uploadStatus === 'uploading' && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="flex items-center gap-2 text-blue-600"
                                            >
                                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-sm">Uploading and analyzing document...</span>
                                            </motion.div>
                                        )}
                                        
                                        {uploadError && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="flex items-center gap-2 text-red-600"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-sm">{uploadError}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Document Preview - Only show when document is uploaded */}
                                    {previewText && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-blue-50 rounded-lg p-3"
                                        >
                                            <h3 className="text-xs font-semibold text-blue-900 mb-1">Document Preview</h3>
                                            <div className="text-xs text-gray-700 max-h-20 overflow-y-auto">
                                                {previewText}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Chat Section - Fixed height with internal scrolling */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col h-[calc(100vh-350px)]">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Chat with the Analyzer</h2>
                                    <button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors"
                                    >
                                        {isExpanded ? 'Collapse' : 'Expand'}
                                    </button>
                                </div>

                                {/* Chat Messages */}
                                <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                                    {chat.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <p>Start a conversation about your document</p>
                                        </div>
                                    ) : (
                                        <AnimatePresence>
                                            {chat.map((message, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                                                        message.role === 'user' 
                                                            ? 'bg-blue-600 text-white ml-auto' 
                                                            : 'bg-gray-100 text-gray-900 mr-auto'
                                                    }`}
                                                >
                                                    <div className="text-sm leading-relaxed">{message.content}</div>
                                                    <div className={`flex items-center justify-between mt-1 ${
                                                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                                    }`}>
                                                        <span className="text-xs">
                                                            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
                                                        </span>
                                                        {message.role === 'assistant' && language !== 'English' && (
                                                            <button
                                                                onClick={async () => {
                                                                    const translated = await translateText(message.content, 'English');
                                                                    if (translated !== message.content) {
                                                                        navigator.clipboard.writeText(translated);
                                                                    }
                                                                }}
                                                                disabled={isTranslating}
                                                                className="text-xs px-2 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors disabled:opacity-50"
                                                            >
                                                                {isTranslating ? 'Translating...' : 'Translate'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    )}
                                    
                                    {loadingChat && (
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex items-center gap-2 text-gray-500"
                                        >
                                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm">Analyzer is thinking...</span>
                                        </motion.div>
                                    )}
                                    
                                    {chatError && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-red-50 border border-red-200 rounded-lg p-3"
                                        >
                                            <div className="flex items-center gap-2 text-red-600">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-sm font-medium">Chat Error</span>
                                            </div>
                                            <p className="text-red-600 text-sm mt-1">{chatError}</p>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Chat Input */}
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                            placeholder="Ask a question about your document..."
                                            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            disabled={!documentId || loadingChat}
                                        />
                                        <button
                                            onClick={sendMessage}
                                            disabled={!question.trim() || !documentId || loadingChat}
                                            className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    {!documentId && (
                                        <p className="text-xs text-gray-500 text-center">
                                            Upload a document to start chatting
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Section - Analysis */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="h-full"
                        >
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col h-[calc(100vh-200px)]">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis of the Document</h2>
                                
                                {loadingAnalysis ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Analyzing document...</span>
                                        </div>
                                    </div>
                                ) : analysisError ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="text-center">
                                            <div className="w-12 h-12 mx-auto mb-3 text-red-500">
                                                <svg fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <p className="text-red-600 font-medium mb-2">Analysis Failed</p>
                                            <p className="text-gray-600 text-sm mb-4">{analysisError}</p>
                                            <button 
                                                onClick={() => startAnalysis()}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Retry Analysis
                                            </button>
                                        </div>
                                    </div>
                                ) : analysis ? (
                                    <div className="flex flex-col h-full">
                                        {/* Summary Section - Scrollable */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex-1 flex flex-col"
                                        >
                                            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex-1 flex flex-col">
                                                <h3 className="text-sm font-semibold text-blue-900 tracking-wide mb-3">SUMMARY</h3>
                                                {(() => {
                                                    // Console logging for analysis data
                                                    console.log('=== ANALYSIS DATA IN SUMMARY SECTION ===');
                                                    console.log('Full analysis object:', analysis);
                                                    console.log('analysis.summary:', analysis.summary);
                                                    console.log('analysis.Summary:', analysis.Summary);
                                                    console.log('analysis.summary_text:', analysis.summary_text);
                                                    console.log('Available keys:', Object.keys(analysis));
                                                    
                                                    // Try to find any field that might contain summary
                                                    const possibleSummaryFields = ['summary', 'Summary', 'summary_text', 'summaryText', 'document_summary', 'analysis_summary', 'text', 'content', 'result', 'output'];
                                                    for (const field of possibleSummaryFields) {
                                                        if (analysis[field]) {
                                                            console.log(`Found summary in field '${field}':`, analysis[field]);
                                                        }
                                                    }
                                                    console.log('=====================================');
                                                    return null;
                                                })()}
                                                
                                                {/* Scrollable Summary Content */}
                                                <div className="flex-1 overflow-y-auto mb-4 max-h-110">
                                                    <p className="text-gray-900 text-sm leading-relaxed">
                                                        {analysis.summary || 
                                                         analysis.Summary || 
                                                         analysis.summary_text || 
                                                         analysis.summaryText ||
                                                         analysis.document_summary ||
                                                         analysis.analysis_summary ||
                                                         analysis.text ||
                                                         analysis.content ||
                                                         analysis.result ||
                                                         analysis.output ||
                                                         (typeof analysis === 'string' ? analysis : 'No summary available')}
                                                    </p>
                                                </div>
                                                
                                                {/* Fixed Action Buttons */}
                                                <div className="flex gap-2 flex-wrap">
                                                    <button 
                                                        onClick={() => {
                                                            const summaryText = analysis.summary || 
                                                                             analysis.Summary || 
                                                                             analysis.summary_text || 
                                                                             analysis.summaryText ||
                                                                             analysis.document_summary ||
                                                                             analysis.analysis_summary ||
                                                                             analysis.text ||
                                                                             analysis.content ||
                                                                             analysis.result ||
                                                                             analysis.output ||
                                                                             (typeof analysis === 'string' ? analysis : '');
                                                            navigator.clipboard.writeText(summaryText);
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700 transition-colors"
                                                    >
                                                        Copy
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            const summaryText = analysis.summary || 
                                                                             analysis.Summary || 
                                                                             analysis.summary_text || 
                                                                             analysis.summaryText ||
                                                                             analysis.document_summary ||
                                                                             analysis.analysis_summary ||
                                                                             analysis.text ||
                                                                             analysis.content ||
                                                                             analysis.result ||
                                                                             analysis.output ||
                                                                             (typeof analysis === 'string' ? analysis : '');
                                                            downloadText('summary.txt', summaryText);
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-800 text-xs hover:bg-gray-300 transition-colors"
                                                    >
                                                        Download
                                                    </button>
                                                    {language !== 'English' && (
                                                        <button 
                                                            onClick={async () => {
                                                                const translated = await translateText(analysis.summary || '', 'English');
                                                                if (translated !== analysis.summary) {
                                                                    navigator.clipboard.writeText(translated);
                                                                }
                                                            }}
                                                            disabled={isTranslating}
                                                            className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700 disabled:opacity-50 transition-colors"
                                                        >
                                                            {isTranslating ? 'Translating...' : 'Translate to English'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Language Info - Fixed at bottom */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200"
                                        >
                                            <div className="text-xs text-gray-600">
                                                Language: <span className="font-medium text-gray-900">{analysis.language || language}</span>
                                            </div>
                                        </motion.div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p>Upload a document to see analysis results</p>
                                    </div>
                                )}
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