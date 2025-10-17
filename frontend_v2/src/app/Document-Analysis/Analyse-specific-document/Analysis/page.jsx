
'use client'
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

import { useI18n } from "../../../../../components/I18nProvider.jsx";
import StructuredText from "../../../../components/StructuredText.jsx";
import useAppLanguage from "../../../../../components/useAppLanguage.js";
import LanguageSelector from "../../../../../components/LanguageSelector.jsx";

export default function AnalysisPage() {
    const { t } = useI18n();
    const { language } = useAppLanguage();
    const searchParams = useSearchParams();

    const [userId] = useState('default_user');
    const [documentId, setDocumentId] = useState(null);
    const [documentType, setDocumentType] = useState('general');
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
    const [isRecording, setIsRecording] = useState(false);

    const [isTranslating, setIsTranslating] = useState(false);
    const [showUploadPanel, setShowUploadPanel] = useState(true);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat]);

    useEffect(() => {
        const dt = searchParams?.get('document_type');
        if (dt) setDocumentType(dt);
    }, [searchParams]);

    async function handleFileUpload(file) {
        if (!file) return;

        setIsUploading(true);
        setUploadError(null);
        setAnalysisError(null);
        setChatError(null);

        try {
            const form = new FormData();
            form.append('file', file);
            const url = `/api/analyzer/upload?user_id=${encodeURIComponent(userId)}&document_type=${encodeURIComponent(documentType)}`;

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
                body: JSON.stringify({ document_id: docId, language, user_id: userId, document_type: documentType })
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
                body: JSON.stringify({ document_id: documentId, question: q, language, user_id: userId, document_type: documentType })
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

    function toggleVoiceRecording() {
        // Placeholder for future audio capture integration
        setIsRecording(prev => !prev);
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

    // Enhanced analysis data parsing and extraction
    const parseAnalysisData = (analysisData) => {
        if (!analysisData) return null;
        
        // Handle string responses
        if (typeof analysisData === 'string') {
            return {
                summary: analysisData,
                keyPoints: [],
                insights: [],
                recommendations: [],
                metadata: {}
            };
        }

        // Handle object responses - try different possible structures
        const result = {
            summary: analysisData.summary || analysisData.Summary || analysisData.summary_text || 
                    analysisData.summaryText || analysisData.document_summary || 
                    analysisData.analysis_summary || analysisData.text || 
                    analysisData.content || analysisData.result || analysisData.output || '',
            
            keyPoints: analysisData.key_points || analysisData.keyPoints || 
                      analysisData.main_points || analysisData.points || 
                      analysisData.highlights || analysisData.bullet_points || [],
            
            insights: analysisData.insights || analysisData.analysis || 
                     analysisData.findings || analysisData.observations || [],
            
            recommendations: analysisData.recommendations || analysisData.suggestions || 
                           analysisData.actions || analysisData.next_steps || [],
            
            metadata: {
                documentType: analysisData.document_type || analysisData.type || 'Unknown',
                confidence: analysisData.confidence || analysisData.score || null,
                wordCount: analysisData.word_count || analysisData.wordCount || null,
                language: analysisData.language || analysisData.detected_language || null,
                topics: analysisData.topics || analysisData.keywords || analysisData.tags || [],
                sentiment: analysisData.sentiment || analysisData.emotion || null,
                riskLevel: analysisData.risk_level || analysisData.riskLevel || null,
                compliance: analysisData.compliance || analysisData.legal_issues || []
            }
        };

        // If we have a nested structure, try to extract from it
        if (analysisData.data) {
            const nestedData = parseAnalysisData(analysisData.data);
            return { ...result, ...nestedData };
        }

        // If we have sections array, parse it
        if (analysisData.sections && Array.isArray(analysisData.sections)) {
            analysisData.sections.forEach(section => {
                const sectionType = section.type || section.title?.toLowerCase();
                switch (sectionType) {
                    case 'summary':
                        result.summary = section.content || section.text || result.summary;
                        break;
                    case 'key points':
                    case 'keypoints':
                        result.keyPoints = section.content || section.items || result.keyPoints;
                        break;
                    case 'insights':
                        result.insights = section.content || section.items || result.insights;
                        break;
                    case 'recommendations':
                        result.recommendations = section.content || section.items || result.recommendations;
                        break;
                }
            });
        }

        return result;
    };

    const parsedAnalysis = parseAnalysisData(analysis);

    // Render long plain text into modular, readable blocks with detected headings and lists
    const renderStructuredText = (rawText) => {
        if (!rawText || typeof rawText !== 'string') return null;

        const text = rawText.trim();

        // Find sections like "HEADING:" in all caps
        const sectionRegex = /(\n|^)([A-Z][A-Z\s/&\-]{3,}?):\s*/g;
        const sections = [];
        let lastIndex = 0;
        let match;

        while ((match = sectionRegex.exec(text)) !== null) {
            const headingStart = match.index + match[1].length;
            const heading = match[2].trim();
            if (sections.length === 0 && headingStart > 0) {
                const preface = text.slice(0, match.index).trim();
                if (preface) sections.push({ title: null, body: preface });
            }
            if (lastIndex !== 0) {
                const prev = text.slice(lastIndex, match.index).trim();
                if (prev) sections[sections.length - 1].body += `\n${prev}`;
            }
            sections.push({ title: heading, body: '' });
            lastIndex = sectionRegex.lastIndex;
        }

        if (sections.length === 0) {
            sections.push({ title: null, body: text });
        } else {
            const tail = text.slice(lastIndex).trim();
            if (tail) sections[sections.length - 1].body += (sections[sections.length - 1].body ? '\n' : '') + tail;
        }

        const splitBodyIntoBlocks = (body) => {
            if (!body) return [];
            // Prefer list split on " - " if there are multiple bullets
            const dashParts = body.split(/\s-\s+/).filter(Boolean);
            if (dashParts.length >= 4) {
                return [{ type: 'list', items: dashParts.map(s => s.replace(/^[\-\u2022]+\s*/, '').trim()).filter(Boolean) }];
            }
            // Otherwise split on semicolons as items when many
            const semiParts = body.split(/;\s+/).filter(Boolean);
            if (semiParts.length >= 5) {
                return [{ type: 'list', items: semiParts }];
            }
            // Otherwise paragraphs: split on double newlines or long sentences
            const paraParts = body
                .split(/\n{2,}/)
                .flatMap(p => p.split(/(?<=[.!?])\s{2,}/))
                .map(p => p.trim())
                .filter(Boolean);
            return paraParts.map(p => ({ type: 'para', text: p }));
        };

        return (
            <div className="space-y-4">
                {sections.map((sec, i) => {
                    const blocks = splitBodyIntoBlocks(sec.body);
                    return (
                        <div key={i} className="space-y-2">
                            {sec.title && (
                                <h4 className="text-sm md:text-base font-semibold text-gray-900">{sec.title}</h4>
                            )}
                            {blocks.map((b, j) => b.type === 'para' ? (
                                <p key={j} className="text-gray-800 text-sm md:text-base leading-relaxed md:leading-7">{b.text}</p>
                            ) : (
                                <ul key={j} className="list-disc pl-5 space-y-1 text-gray-800 text-sm md:text-base">
                                    {b.items.map((it, k) => (
                                        <li key={k} className="leading-relaxed">{it}</li>
                                    ))}
                                </ul>
                            ))}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Component for rendering key points as a list
    const renderKeyPoints = (points) => {
        if (!points || points.length === 0) return null;
        
        const pointsArray = Array.isArray(points) ? points : [points];
        
        return (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-base md:text-lg font-semibold text-amber-800 uppercase tracking-wide">{t('keyPoints')}</h3>
                </div>
                <ul className="space-y-3">
                    {pointsArray.map((point, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3 text-base text-gray-800 leading-relaxed"
                        >
                            <span className="flex-shrink-0 w-1.5 h-1.5 bg-amber-600 rounded-full mt-2"></span>
                            <span className="leading-relaxed">{typeof point === 'string' ? point : point.text || point.content || JSON.stringify(point)}</span>
                        </motion.li>
                    ))}
                </ul>
            </div>
        );
    };

    // Component for rendering insights
    const renderInsights = (insights) => {
        if (!insights || insights.length === 0) return null;
        
        const insightsArray = Array.isArray(insights) ? insights : [insights];
        
        return (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h3 className="text-base md:text-lg font-semibold text-purple-800 uppercase tracking-wide">{t('insights')}</h3>
                </div>
                <div className="space-y-4">
                    {insightsArray.map((insight, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/50 rounded-lg p-4 border border-purple-100"
                        >
                            <p className="text-base text-gray-800 leading-relaxed md:leading-7">
                                {typeof insight === 'string' ? insight : insight.text || insight.content || insight.description || JSON.stringify(insight)}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    };

    // Component for rendering recommendations
    const renderRecommendations = (recommendations) => {
        if (!recommendations || recommendations.length === 0) return null;
        
        const recommendationsArray = Array.isArray(recommendations) ? recommendations : [recommendations];
        
        return (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="text-base md:text-lg font-semibold text-green-800 uppercase tracking-wide">{t('recommendations')}</h3>
                </div>
                <div className="space-y-3">
                    {recommendationsArray.map((rec, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3 text-base text-gray-800 leading-relaxed"
                        >
                            <span className="flex-shrink-0 w-1.5 h-1.5 bg-green-600 rounded-full mt-2"></span>
                            <span className="leading-relaxed">{typeof rec === 'string' ? rec : rec.text || rec.content || rec.action || JSON.stringify(rec)}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    };

    // Component for rendering metadata
    const renderMetadata = (metadata) => {
        if (!metadata || Object.keys(metadata).length === 0) return null;
        
        return (
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-base md:text-lg font-semibold text-gray-800 uppercase tracking-wide">{t('documentMetadata')}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {metadata.documentType && (
                        <div className="bg-white/50 rounded-lg p-3">
                            <span className="text-xs font-medium text-gray-600">{t('documentType')}:</span>
                            <p className="text-base text-gray-800 mt-1">{metadata.documentType}</p>
                        </div>
                    )}
                    {metadata.language && (
                        <div className="bg-white/50 rounded-lg p-3">
                            <span className="text-xs font-medium text-gray-600">{t('language')}:</span>
                            <p className="text-base text-gray-800 mt-1">{metadata.language}</p>
                        </div>
                    )}
                    {metadata.wordCount && (
                        <div className="bg-white/50 rounded-lg p-3">
                            <span className="text-xs font-medium text-gray-600">{t('wordCount')}:</span>
                            <p className="text-base text-gray-800 mt-1">{metadata.wordCount.toLocaleString()}</p>
                        </div>
                    )}
                    {metadata.confidence && (
                        <div className="bg-white/50 rounded-lg p-3">
                            <span className="text-xs font-medium text-gray-600">{t('confidence')}:</span>
                            <p className="text-base text-gray-800 mt-1">{Math.round(metadata.confidence * 100)}%</p>
                        </div>
                    )}
                    {metadata.sentiment && (
                        <div className="bg-white/50 rounded-lg p-3">
                            <span className="text-xs font-medium text-gray-600">{t('sentiment')}:</span>
                            <p className={`text-sm font-medium ${
                                metadata.sentiment.toLowerCase().includes('positive') ? 'text-green-600' :
                                metadata.sentiment.toLowerCase().includes('negative') ? 'text-red-600' :
                                'text-gray-600'
                            } mt-1`}>{metadata.sentiment}</p>
                        </div>
                    )}
                    {metadata.riskLevel && (
                        <div className="bg-white/50 rounded-lg p-3">
                            <span className="text-xs font-medium text-gray-600">{t('riskLevel')}:</span>
                            <p className={`text-sm font-medium ${
                                metadata.riskLevel.toLowerCase().includes('high') ? 'text-red-600' :
                                metadata.riskLevel.toLowerCase().includes('medium') ? 'text-yellow-600' :
                                'text-green-600'
                            } mt-1`}>{metadata.riskLevel}</p>
                        </div>
                    )}
                </div>
                {metadata.topics && metadata.topics.length > 0 && (
                    <div className="mt-4">
                        <span className="text-xs font-medium text-gray-600">{t('topics')}:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {metadata.topics.map((topic, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {topic}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                {metadata.compliance && metadata.compliance.length > 0 && (
                    <div className="mt-4">
                        <span className="text-xs font-medium text-gray-600">{t('complianceIssues')}:</span>
                        <div className="space-y-2 mt-2">
                            {metadata.compliance.map((issue, index) => (
                                <div key={index} className="text-xs text-red-600 bg-red-50 rounded p-1">
                                    {issue}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
            {/* Main Content */}
            <div className="flex-1 w-full max-w-screen-2xl mx-auto px-2 sm:px-3 md:px-4 py-3 sm:py-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3"
                >
                    <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
                        <div className="text-center sm:text-left">
                            <h1 className="text-3xl md:text-4xl pb-2 pt-2 
                            font-bold leading-tight bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-2">
                                {t('documentAnalysisTitle')}
                            </h1>
                            <p className="text-gray-600">{t('documentAnalysisSubtitle')}</p>
                        </div>
                        <div className="hidden sm:block">
                            <LanguageSelector />
                        </div>
                    </div>
                </motion.div>

                {/* Single Column Layout - Analysis Full Width */}
                <div className="grid grid-cols-1 gap-2 sm:gap-3 h-[calc(100vh-150px)] min-h-[560px]">
                    {/* Analysis (Full Width) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col"
                    >
                        {/* Analysis Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col flex-1 min-h-0"
                        >
                            <div className="px-3 sm:px-4 md:px-6 py-2 border-b border-gray-100 bg-gradient-to-r from-[#0818A8]/5 to-blue-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900">{t('analysisOfDocument')}</h3>
                                        <p className="text-xs text-gray-500">{t('aiPoweredInsights')}</p>
                                    </div>
                                    {analysis && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={clearSession}
                                            className="p-2 rounded-full hover:bg-red-50 transition-colors"
                                            aria-label="Clear"
                                        >
                                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </motion.button>
                                    )}
                                </div>
                            </div>

                            {/* Analysis Content + Conversation */}
                            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 min-h-0 max-h-[calc(100vh-220px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                {loadingAnalysis ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                                className="w-12 h-12 border-4 border-[#0818A8]/20 border-t-[#0818A8] rounded-full mx-auto mb-4"
                                            ></motion.div>
                                            <p className="text-gray-600">{t('analyzingDocument')}</p>
                                        </div>
                                    </div>
                                ) : analysisError ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <div className="w-12 h-12 mx-auto mb-4 text-red-400">
                                                <svg fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <p className="text-red-600 font-medium mb-4">{analysisError}</p>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => startAnalysis()}
                                                className="px-4 py-2 bg-[#0818A8] text-white rounded-full hover:bg-[#0A1BB8] transition-colors"
                                            >
                                                {t('retryAnalysis')}
                                            </motion.button>
                                        </div>
                                    </div>
                                ) : parsedAnalysis ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        {/* Summary Section */}
                                        {parsedAnalysis.summary && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                                className="bg-gradient-to-br from-[#0818A8]/5 to-blue-50 rounded-xl p-6 border border-[#0818A8]/20"
                                            >
                                                <div className="flex items-center gap-2 mb-3">
                                                    <svg className="w-5 h-5 text-[#0818A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <h3 className="text-base md:text-lg font-semibold text-[#0818A8] uppercase tracking-wide">{t('summary')}</h3>
                                                </div>
                                                <div className="mb-5">
                                                    <StructuredText text={parsedAnalysis.summary} />
                                                </div>
                                            <div className="flex gap-2 flex-wrap">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                        onClick={() => navigator.clipboard.writeText(parsedAnalysis.summary)}
                                                    className="px-3 py-2 rounded-full bg-white text-[#0818A8] text-xs font-medium shadow-sm hover:shadow-md transition-all border border-[#0818A8]/20"
                                                >
                                                    {t('copy')}
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                        onClick={() => downloadText('summary.txt', parsedAnalysis.summary)}
                                                    className="px-3 py-2 rounded-full bg-[#0818A8] text-white text-xs font-medium shadow-sm hover:shadow-md transition-all"
                                                >
                                                    {t('download')}
                                                </motion.button>
                                            </div>
                                            </motion.div>
                                        )}

                                        {/* Key Points Section */}
                                        {renderKeyPoints(parsedAnalysis.keyPoints)}

                                        {/* Insights Section */}
                                        {renderInsights(parsedAnalysis.insights)}

                                        {/* Recommendations Section */}
                                        {renderRecommendations(parsedAnalysis.recommendations)}

                                        {/* Metadata Section */}
                                        {renderMetadata(parsedAnalysis.metadata)}

                                        {/* Conversation Section */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 }}
                                                className="bg-white rounded-xl p-4 border border-gray-200"
                                            >
                                                <div className="flex items-center gap-2 mb-4">
                                                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                                    <h3 className="text-base md:text-lg font-semibold text-gray-900 uppercase tracking-wide">{t('conversation')}</h3>
                                        </div>
                                                <div className="space-y-3">
                                        {chat.length === 0 && !loadingChat ? (
                                            <div className="flex items-center justify-center py-10 text-gray-600">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
                                                        <svg className="w-8 h-8 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                            <path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" strokeLinejoin="round"/>
                                                            <path d="M14 3v5h5" strokeLinejoin="round"/>
                                                            <path d="M8 12h8M8 16h6" strokeLinecap="round"/>
                                                        </svg>
                                                    </div>
                                                    <div className="text-sm leading-relaxed">
                                                        <div className="font-medium text-gray-700">{t('chatWithAnalyzer')}</div>
                                                        <div className="text-gray-500">{t('startConversationHint')}</div>
                                                    </div>
                                        </div>
                                    </div>
                                ) : (
                                            chat.map((message, idx) => (
                                            <motion.div
                                                key={idx}
                                                            initial={{ opacity: 0, y: 12, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[80%] ${message.role === 'user'
                                                    ? 'bg-[#0818A8] text-white rounded-2xl rounded-br-md'
                                                    : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md'
                                                    } px-4 py-3 shadow-sm`}>
                                                    {message.role === 'user' ? (
                                                    <p className="text-sm leading-relaxed">{message.content}</p>
                                                    ) : (
                                                        <div className="text-sm leading-relaxed">
                                                            <StructuredText text={message.content} />
                                                        </div>
                                                    )}
                                                    <span className={`text-xs mt-1 block ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                                                        {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))
                                        )}
                                        {loadingChat && (
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
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
                                                </div>
                                            </motion.div>

                                        {/* Document Preview */}
                                        {previewText && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.6 }}
                                                className="bg-gray-50 rounded-xl p-3 border border-gray-200"
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{t('documentPreview')}</h3>
                                                </div>
                                                <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{previewText}</p>
                                            </motion.div>
                                        )}

                                        {/* Raw Analysis Data (for debugging/fallback) */}
                                        {!parsedAnalysis.summary && !parsedAnalysis.keyPoints?.length && !parsedAnalysis.insights?.length && analysis && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.6 }}
                                                className="bg-yellow-50 rounded-xl p-4 border border-yellow-200"
                                            >
                                                <div className="flex items-center gap-2 mb-3">
                                                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                    </svg>
                                                    <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wide">{t('rawAnalysis')}</h3>
                                                </div>
                                                <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-40">
                                                    {JSON.stringify(analysis, null, 2)}
                                                </pre>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="w-full max-w-md">
                                            <div className="text-center mb-4 text-gray-600 text-sm">{t('uploadDocumentToAnalyze')}</div>
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
                                                className="w-full bg-[#0818A8] hover:bg-[#0A1BB8] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                                        />
                                                        <span className="text-sm font-medium">{t('uploading')}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                        <span className="text-sm font-medium">{t('chooseDocument')}</span>
                                                    </>
                                                )}
                                            </motion.button>
                                            {uploadError && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600"
                                                >
                                                    {uploadError}
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Chat Input at bottom of analysis card */}
                            <div className="px-4 sm:px-6 py-3 border-t border-gray-100 bg-gray-50">
                                <div className="flex gap-2">
                                    <input
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                        placeholder={t('askPlaceholder')}
                                        className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-[#0818A8] transition-colors bg-white"
                                        disabled={loadingChat || !documentId}
                                    />
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        onClick={toggleVoiceRecording}
                                        aria-pressed={isRecording}
                                        aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
                                        className={`px-3 py-2 rounded-full border text-sm transition-colors flex items-center gap-2 ${isRecording ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        <svg className={`w-4 h-4 ${isRecording ? 'text-rose-600' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 12a3 3 0 003-3V5a3 3 0 10-6 0v4a3 3 0 003 3z" />
                                            <path fillRule="evenodd" d="M5 9a1 1 0 112 0 3 3 0 006 0 1 1 0 112 0 5 5 0 01-4 4.9V16h2a1 1 0 110 2H9a1 1 0 110-2h2v-2.1A5 5 0 015 9z" clipRule="evenodd" />
                                        </svg>
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={sendMessage}
                                        disabled={!question.trim() || loadingChat || !documentId}
                                        className="px-4 bg-[#0818A8] text-white rounded-full hover:bg-[#0A1BB8] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </motion.button>
                                </div>
                                {isRecording && (
                                    <div className="mt-2 text-xs text-rose-700 flex items-center gap-2">
                                        <span className="inline-block w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                                        Recording…
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right panel removed in full-width layout */}
                </div>
            </div>

            {/* Mobile language selector */}
            <div className="sm:hidden fixed bottom-6 left-6 z-50">
                <LanguageSelector />
            </div>
        </div>
    );
}
