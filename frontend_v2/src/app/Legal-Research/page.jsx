'use client'

import Navbar from "../../../components/Navbar.jsx";
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from "../../../components/LanguageSelector.jsx";
import { useI18n } from "../../../components/I18nProvider.jsx";
import { useNavbar } from "../../../components/NavbarContext.jsx";

export default function LegalResearch() {
    const { t, lang } = useI18n();
    const { isCollapsed, isLargeScreen } = useNavbar();
    const [answerType, setAnswerType] = useState('detailed');
    const [question, setQuestion] = useState('');
    const [chat, setChat] = useState([]); // {role, content, ts}
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [panel, setPanel] = useState({ title: '', text: '', summary: '', references: [] });
    const [showFullAnswer, setShowFullAnswer] = useState(true);
    const [health, setHealth] = useState('unknown');
    const [dark, setDark] = useState(false);
    const [showAnswerTypeDropdown, setShowAnswerTypeDropdown] = useState(false);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    // Sample questions with translations
    const sampleQuestions = [
        "Is a domestic incident report mandatory for filing a case under the Domestic Violence Act?",
        "The opposing client is not accepting summons; what can I do?",
        "Can a missing person be declared dead by the court? What are the legal provisions?"
    ];

    useEffect(() => {
        fetch('/api/legal-research/health-check')
            .then(r => r.json()).then(() => setHealth('running'))
            .catch(() => setHealth('unreachable'));
    }, []);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [chat, isSending]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showAnswerTypeDropdown && !event.target.closest('.answer-type-dropdown')) {
                setShowAnswerTypeDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showAnswerTypeDropdown]);

    async function send(questionText = null) {
        const q = questionText || question.trim();
        if (!q) return;
        
        // Start the conversation
        if (!hasStarted) {
            setHasStarted(true);
            setIsLoading(true);
        }
        
        setQuestion('');
        setChat(prev => [...prev, { role: 'user', content: q, ts: new Date() }]);
        setIsSending(true);
        setError('');
        
        try {
            const res = await fetch('/api/legal-research/process/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: q, answer_type: answerType, language: mapLang(lang) })
            });
            const json = await res.json();
            const title = json?.title || 'Response';
            const text = json?.text || '';
            const summary = json?.summary || '';
            const references = Array.isArray(json?.references) ? json.references : [];
            setChat(prev => [...prev, { role: 'assistant', content: text, ts: new Date() }]);
            setPanel({ title, text, summary, references });
        } catch (e) {
            setError('Service unavailable. Please try again.');
            setChat(prev => [...prev, { role: 'assistant', content: 'Service unavailable. Please try again.', ts: new Date() }]);
        } finally { 
            setIsSending(false);
            setIsLoading(false);
        }
    }

    function handleSampleQuestion(question) {
        send(question);
    }

    function exportChat() {
        const text = chat.map(m => `${m.ts ? new Date(m.ts).toLocaleString() : ''} \n${m.role.toUpperCase()}: ${m.content}\n`).join('\n');
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'legal-research-chat.txt';
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    }

    function exportNote() {
        const title = panel.title || 'Answer';
        const summary = panel.summary ? `\n\nSummary:\n${panel.summary}` : '';
        const text = panel.text ? `\n\nAnswer:\n${panel.text}` : '';
        const refs = Array.isArray(panel.references) && panel.references.length
            ? `\n\nSources:\n${panel.references.map((r, i) => `- ${r.case || 'Reference'} ${r.citation ? `(${r.citation})` : ''}`).join('\n')}`
            : '';
        const full = `${title}${summary}${text}${refs}`.trim();
        const blob = new Blob([full], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'legal-research-note.txt';
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    }

    function clearChat() { setChat([]); setPanel({ title: '', text: '', summary: '', references: [] }); }

    function toggleVoiceChat() {
        setIsVoiceActive(!isVoiceActive);
        // TODO: Implement actual voice recognition functionality
        console.log('Voice chat toggled:', !isVoiceActive);
    }

    return (
        <>
            <Navbar />
            <div 
                className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50 text-slate-900 transition-all duration-300"
                style={{
                    marginLeft: isLargeScreen ? (isCollapsed ? '0px' : '0px') : '0px'
                }}
            >
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="sticky top-0 z-10 backdrop-blur-md bg-white/90 border-b border-slate-200/70 shadow-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 mb-6 sm:mb-8"
                    >
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                                Legal Research
                                    </h1>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs px-2 py-1 rounded-full ${health==='running'?'bg-green-100 text-green-700':'bg-slate-100 text-slate-600'}`}>
                                    {health}
                                </span>
                                <LanguageSelector />
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <AnimatePresence mode="wait">
                        {!hasStarted ? (
                            // Landing Page
                            <motion.div
                                key="landing"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                            >
                                {/* Main Heading */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="mb-8"
                                >
                                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
                                        Your Legal Research Assistant
                                    </h2>
                                    <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
                                        Get instant answers to your legal questions with AI-powered research
                                    </p>
                                </motion.div>

                                {/* Search Bar */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    className="w-full max-w-2xl mb-8"
                                >
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    send();
                                                }
                                            }}
                                            placeholder="Type your legal query here"
                                            className="w-full rounded-2xl border-2 border-slate-200 bg-white/90 backdrop-blur-sm px-6 py-4 text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400 transition-all duration-200 placeholder:text-slate-400"
                                        />
                            <button 
                                            onClick={() => send()}
                                            disabled={!question.trim() || isSending}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white hover:from-sky-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
                                        >
                                            {isSending ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>

                                {/* Sample Questions */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.6 }}
                                    className="w-full max-w-3xl"
                                >
                                    <h3 className="text-lg font-semibold text-slate-700 mb-4">
                                        Sample Questions:
                                    </h3>
                                    <div className="space-y-3">
                                        {sampleQuestions.map((q, index) => (
                                            <motion.button
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                                                onClick={() => handleSampleQuestion(q)}
                                                className="w-full text-left p-4 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm hover:bg-sky-50 hover:border-sky-200 transition-all duration-200 shadow-sm hover:shadow-md group"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                                                        {index + 1}
                                                    </div>
                                                    <p className="text-slate-700 group-hover:text-sky-800 transition-colors">
                                                        {q}
                                                    </p>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            </motion.div>
                        ) : (
                            // Chat Interface
                            <motion.div
                                key="chat"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="grid grid-cols-1 lg:grid-cols-4 gap-6"
                            >
                                {/* Chat Area */}
                                <div className="lg:col-span-3">
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                        className="rounded-xl border border-slate-200/60 bg-white/95 backdrop-blur-sm flex flex-col shadow-lg h-[70vh]"
                                    >
                                        {/* Chat Header */}
                                        <div className="p-4 sm:p-5 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-white/50 flex-shrink-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                                                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-800 text-lg">Legal Research Chat</div>
                                                    <div className="text-sm text-slate-500">Ask your legal questions</div>
                                                </div>
                        </div>
                    </div>

                                        {/* Chat Messages */}
                            <div 
                                ref={scrollRef} 
                                            className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0"
                            >
                            <AnimatePresence>
                                {chat.map((m, i) => (
                                        <motion.div 
                                            key={i} 
                                            initial={{opacity:0,y:8}} 
                                            animate={{opacity:1,y:0}} 
                                            exit={{opacity:0,y:-8}}
                                                        className={`flex items-start gap-3 ${i%2 ? 'flex-row-reverse' : ''}`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                            i%2 ? 'bg-gradient-to-br from-sky-500 to-blue-600' : 'bg-slate-100'
                                                        }`}>
                                                            {i%2 ? (
                                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div className={`max-w-[80%] rounded-xl p-4 ${
                                                            i%2 ? 
                                                            'text-white' :
                                                            'bg-slate-100 text-slate-800'
                                                        }`} style={i%2 ? {backgroundColor: '#0818A8'} : {}}>
                                                            <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                                {m.content}
                                            </div>
                                                            <div className={`text-xs mt-2 opacity-70 ${i%2 ? 'text-white/80' : 'text-slate-500'}`}>
                                                {m.ts ? new Date(m.ts).toLocaleTimeString() : ''}
                                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {isSending && (
                                        <motion.div 
                                            initial={{opacity:0}} 
                                            animate={{opacity:1}} 
                                                        className="flex items-center gap-3"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                                                        </div>
                                                        <div className="bg-slate-100 rounded-xl p-4">
                                                            <div className="text-sm text-slate-600">Processing your query...</div>
                                                        </div>
                                        </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                            
                                        {/* Chat Input */}
                                        <div className="p-4 sm:p-5 border-t border-slate-200/60 bg-gradient-to-r from-slate-50/80 to-white/80 backdrop-blur-sm flex-shrink-0">
                                            {error && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm mb-3"
                                                >
                                                    {error}
                                                </motion.div>
                                            )}
                                            <div className="space-y-3">
                                                <div className="flex gap-2">
                                    <div className="hidden sm:flex gap-1 flex-1">
                                    {['detailed','short'].map(v => (
                                            <button 
                                                key={v} 
                                                onClick={()=>setAnswerType(v)} 
                                                                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                                                                    answerType===v
                                                                        ?'bg-sky-600 text-white shadow'
                                                                        :'text-slate-600 bg-slate-100 hover:bg-slate-200'
                                                                }`}
                                            >
                                                {v==='detailed'?'Detailed':'Short'}
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={toggleVoiceChat}
                                                        className={`px-3 h-9 rounded-lg border transition-all duration-200 ${
                                            isVoiceActive 
                                                                ? 'bg-red-500 border-red-400 hover:bg-red-600 text-white'
                                                                : 'bg-white border-slate-300 hover:border-slate-400 text-slate-600'
                                        } shadow-sm`}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z"/>
                                                            <path d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="flex gap-2">
                                                    <textarea 
                                                        value={question} 
                                                        onChange={e=>setQuestion(e.target.value)} 
                                                        onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); } }} 
                                                        placeholder="Type your legal question…" 
                                                        rows={2}
                                                        className="flex-1 rounded-xl border border-slate-300/60 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400 resize-none transition-all duration-200 placeholder:text-slate-400" 
                                                    />
                                    <button 
                                        onClick={send} 
                                                        disabled={isSending || !question.trim()}
                                                        className="px-4 h-12 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200"
                                                    >
                                                        {isSending ? (
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                            </svg>
                                                        )}
                                                        <span className="hidden sm:inline">Send</span>
                                    </button>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={clearChat} 
                                                        className="px-3 py-1.5 rounded-lg border bg-white border-slate-300 hover:bg-slate-50 text-slate-600 text-sm transition-all duration-200"
                                    >
                                        Clear
                                    </button>
                                    <button 
                                        onClick={exportChat} 
                                                        className="px-3 py-1.5 rounded-lg border bg-white border-slate-300 hover:bg-slate-50 text-slate-600 text-sm transition-all duration-200"
                                    >
                                        Download
                                    </button>
                                                </div>
                                </div>
                        </div>
                    </motion.div>
                            </div>
                            
                                {/* Sample Questions Sidebar */}
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    className="lg:col-span-1"
                                >
                                    <div className="lg:sticky lg:top-24">
                                        <section className="rounded-xl border border-slate-200/60 bg-white/90 backdrop-blur-sm p-4 shadow-sm">
                                            <div className="font-semibold text-slate-800 mb-3 text-sm flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                Sample Questions
                                            </div>
                                            <div className="space-y-2">
                                                {sampleQuestions.map((q, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleSampleQuestion(q)}
                                                        className="w-full text-left p-3 rounded-lg border border-slate-200 bg-white/60 hover:bg-sky-50 hover:border-sky-200 transition-all duration-200 text-xs group"
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <div className="w-4 h-4 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                                                                {index + 1}
                                                            </div>
                                                            <p className="text-slate-600 group-hover:text-sky-700 transition-colors leading-relaxed">
                                                                {q}
                                                            </p>
                                                        </div>
                                                    </button>
                                    ))}
                                </div>
                                        </section>
                            </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
}

function mapLang(l){
    if (!l) return 'en';
    const v = l.toLowerCase();
    if (v.includes('hindi')) return 'hi';
    if (v.includes('marathi')) return 'mr';
    if (v.includes('gujar')) return 'gu';
    return 'en';
}