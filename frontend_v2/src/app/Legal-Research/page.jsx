'use client'

import Navbar from "../../../components/Navbar.jsx";
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from "../../../components/LanguageSelector.jsx";
import { useI18n } from "../../../components/I18nProvider.jsx";

export default function LegalResearch() {
    const { t, lang } = useI18n();
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
    const scrollRef = useRef(null);

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

    async function send() {
        const q = question.trim();
        if (!q) return;
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
        } finally { setIsSending(false); }
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
            <div className={`lg:ml-[270px] md:ml-[100px] sm:ml-20 ml-20 ] min-h-screen ${dark?'bg-[#0b1220] text-slate-100':'bg-gradient-to-br from-white via-[#F9FAFB] to-blue-50 text-gray-900'} p-3 sm:p-4 lg:p-6`}>
                <div className="w-full max-w-[1400px] mx-auto">
                    {/* Header */}
                    <div className="flex flex-col gap-3 mb-4 sm:mb-6">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <button 
                                    onClick={()=>history.back()} 
                                    className={`flex-shrink-0 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border ${dark?'bg-slate-800 border-slate-700 hover:bg-slate-700':'bg-white hover:bg-gray-50'} shadow-sm text-xs sm:text-sm`}
                                >
                                    <span className="hidden sm:inline">← Back</span>
                                    <span className="sm:hidden">←</span>
                                </button>
                                <div className="relative flex-1 min-w-0">
                                    <h1 className={`text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight ${dark?'text-slate-100':'text-slate-900'}`}>
                                        <span className="hidden sm:inline">Legal Research</span>
                                        <span className="sm:hidden">Legal</span>
                                    </h1>
                                    <span className="absolute left-0 -bottom-1 h-0.5 sm:h-1 w-3/4 bg-gradient-to-r from-blue-600 to-teal-500 rounded-full"></span>
                                </div>
                            </div>
                            <span className={`flex-shrink-0 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded ${health==='running'?(dark?'bg-green-900 text-green-200':'bg-green-100 text-green-700'):(dark?'bg-slate-800 text-slate-300':'bg-gray-100 text-gray-600')}`}>
                                {health}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 justify-between sm:justify-end">
                            <button 
                                onClick={()=>setDark(d=>!d)} 
                                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border shadow-sm text-xs sm:text-sm ${dark?'bg-slate-900 border-slate-700':'bg-white'}`}
                            >
                                {dark?'🌙':'☀️'}
                            </button>
                            <LanguageSelector />
                        </div>
                    </div>

                {/* Main grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                    {/* Chat column */}
                        <motion.div 
                            initial={{opacity:0,y:8}} 
                            animate={{opacity:1,y:0}} 
                            className={`rounded-xl sm:rounded-2xl ${dark?'bg-[#0f172a] border-slate-700':'bg-white/90'} border-2 ${dark?'border-slate-700':'border-blue-100'} shadow-lg p-3 sm:p-4 flex flex-col h-[60vh] sm:h-[65vh] lg:h-[70vh] backdrop-blur`}
                        >
                            <div 
                                ref={scrollRef} 
                                className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 p-1 sm:p-2 scrollbar-thin"
                            >
                            <AnimatePresence>
                                {chat.map((m, i) => (
                                        <motion.div 
                                            key={i} 
                                            initial={{opacity:0,y:8}} 
                                            animate={{opacity:1,y:0}} 
                                            exit={{opacity:0,y:-8}}
                                            className={`group max-w-[85%] px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow ${
                                                i%2? 
                                                'bg-gradient-to-r from-blue-600 to-teal-500 text-white ml-auto':
                                                'bg-white/90 border border-blue-100 text-slate-900 mr-auto'
                                            }`}
                                            style={{wordBreak: 'break-word'}}
                                        >
                                            <div className="text-xs sm:text-sm lg:text-base leading-relaxed">
                                                {m.content}
                                            </div>
                                            <div className={`opacity-0 group-hover:opacity-100 transition text-[9px] sm:text-[10px] mt-1 ${i%2?'text-white/80':'text-blue-700/70'}`}>
                                                {m.ts ? new Date(m.ts).toLocaleTimeString() : ''}
                                        </div>
                                    </motion.div>
                                ))}
                                {isSending && (
                                        <motion.div 
                                            initial={{opacity:0}} 
                                            animate={{opacity:1}} 
                                            className="w-max px-2 sm:px-3 py-1 sm:py-1.5 text-xs rounded-full bg-gray-200 text-gray-700"
                                        >
                                            Processing…
                                        </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                            
                            {error && <div className="mt-2 px-2 text-xs sm:text-sm text-red-600">{error}</div>}
                            
                            {/* Input area */}
                            <div className="mt-3 space-y-2">
                                <textarea 
                                    value={question} 
                                    onChange={e=>setQuestion(e.target.value)} 
                                    onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); } }} 
                                    placeholder="Type your legal question…" 
                                    rows={2}
                                    className={`w-full rounded-lg sm:rounded-xl border px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${dark?'bg-slate-900 border-slate-700 text-slate-100':'bg-white border-blue-100 hover:border-blue-200'}`} 
                                />
                                
                                <div className="flex gap-2">
                                    {/* Mobile: Dropdown */}
                                    <div className="sm:hidden relative flex-1 answer-type-dropdown">
                                        <button 
                                            onClick={() => setShowAnswerTypeDropdown(!showAnswerTypeDropdown)}
                                            className={`w-full h-8 flex items-center justify-between px-2 rounded-lg border ${dark?'bg-slate-900 border-slate-700 text-slate-100':'bg-white border-blue-100 hover:border-blue-200'} text-xs`}
                                        >
                                            <span className="capitalize">{answerType}</span>
                                            <svg className={`w-3 h-3 transition-transform ${showAnswerTypeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {showAnswerTypeDropdown && (
                                            <div className={`absolute bottom-full left-0 right-0 mb-1 rounded-lg border shadow-lg z-10 ${dark?'bg-slate-800 border-slate-700':'bg-white border-gray-200'}`}>
                                                {['detailed','short'].map(v => (
                                                    <button 
                                                        key={v} 
                                                        onClick={() => {
                                                            setAnswerType(v);
                                                            setShowAnswerTypeDropdown(false);
                                                        }}
                                                        className={`w-full px-2 py-1.5 text-left text-xs ${answerType===v?(dark?'bg-teal-600 text-white':'bg-blue-600 text-white'):(dark?'text-slate-200 hover:bg-slate-800':'text-gray-700 hover:bg-gray-50')} first:rounded-t-lg last:rounded-b-lg`}
                                                    >
                                                        {v==='detailed'?'Detailed':'Short'}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Desktop: Toggle buttons */}
                                    <div className="hidden sm:flex gap-1 flex-1">
                                    {['detailed','short'].map(v => (
                                            <button 
                                                key={v} 
                                                onClick={()=>setAnswerType(v)} 
                                                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${answerType===v?(dark?'bg-teal-600 text-white shadow':'bg-blue-600 text-white shadow'):(dark?'text-slate-200 bg-slate-800 hover:bg-slate-700':'text-gray-700 bg-gray-100 hover:bg-gray-200')}`}
                                            >
                                                {v==='detailed'?'Detailed':'Short'}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {/* Voice Chat Button */}
                                    <button 
                                        onClick={toggleVoiceChat}
                                        className={`px-2 sm:px-3 h-8 sm:h-9 rounded-lg border transition-all duration-200 ${
                                            isVoiceActive 
                                                ? (dark ? 'bg-red-600 border-red-500 hover:bg-red-700' : 'bg-red-500 border-red-400 hover:bg-red-600')
                                                : (dark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-blue-100 hover:border-blue-200')
                                        } shadow-sm`}
                                        title={isVoiceActive ? 'Stop Voice Chat' : 'Start Voice Chat'}
                                    >
                                        <svg 
                                            width="16" 
                                            height="16" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            className={`transition-colors duration-200 ${
                                                isVoiceActive ? 'text-white' : (dark ? 'text-slate-300' : 'text-gray-600')
                                            }`}
                                        >
                                            {/* Microphone Icon */}
                                            <path 
                                                d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" 
                                                fill="currentColor"
                                            />
                                            <path 
                                                d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10" 
                                                stroke="currentColor" 
                                                strokeWidth="2" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"
                                            />
                                            <path 
                                                d="M12 19V23" 
                                                stroke="currentColor" 
                                                strokeWidth="2" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"
                                            />
                                            <path 
                                                d="M8 23H16" 
                                                stroke="currentColor" 
                                                strokeWidth="2" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"
                                            />
                                            {/* Sound waves animation when active */}
                                            {isVoiceActive && (
                                                <>
                                                    <path 
                                                        d="M20 8L22 10L20 12" 
                                                        stroke="currentColor" 
                                                        strokeWidth="1.5" 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round"
                                                        className="animate-pulse"
                                                    />
                                                    <path 
                                                        d="M18 6L20 8L18 10" 
                                                        stroke="currentColor" 
                                                        strokeWidth="1.5" 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round"
                                                        className="animate-pulse"
                                                        style={{animationDelay: '0.1s'}}
                                                    />
                                                </>
                                            )}
                                        </svg>
                                    </button>
                                    
                                    <button 
                                        onClick={send} 
                                        disabled={isSending}
                                        className={`px-3 sm:px-4 h-8 sm:h-9 rounded-lg ${dark?'bg-teal-600 hover:bg-teal-700':'bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1e4ed8] hover:to-[#2563eb]'} text-white font-semibold shadow-md text-xs sm:text-sm disabled:opacity-50`}
                                    >
                                        Send
                                    </button>
                                </div>
                                
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={clearChat} 
                                        className={`px-2 sm:px-3 py-1 rounded-lg border ${dark?'bg-slate-900 border-slate-700':'bg-white'} shadow-sm hover:opacity-90 text-xs sm:text-sm`}
                                    >
                                        Clear
                                    </button>
                                    <button 
                                        onClick={exportChat} 
                                        className={`px-2 sm:px-3 py-1 rounded-lg border ${dark?'bg-slate-900 border-slate-700':'bg-white'} shadow-sm hover:opacity-90 text-xs sm:text-sm`}
                                    >
                                        Download
                                    </button>
                                </div>
                        </div>
                    </motion.div>

                    {/* Answer panel */}
                        <motion.div 
                            initial={{opacity:0,y:8}} 
                            animate={{opacity:1,y:0}} 
                            className={`rounded-xl sm:rounded-2xl ${dark?'bg-[#0f172a] border-slate-700 text-slate-100':'bg-white/90'} border-2 ${dark?'border-slate-700':'border-blue-100'} shadow-lg p-3 sm:p-4 h-fit backdrop-blur`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-2">
                                <div className="text-sm sm:text-lg lg:text-xl font-bold tracking-tight" style={{wordBreak: 'break-word'}}>
                                    {panel.title || 'Answer'}
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <button 
                                        onClick={()=>setShowFullAnswer(s=>!s)} 
                                        className={`px-2 sm:px-3 py-1 rounded-full border ${dark?'bg-slate-900 border-slate-700':'bg-white'} text-[10px] sm:text-xs shadow-sm`}
                                    >
                                        {showFullAnswer?'Summary':'Full'}
                                    </button>
                                    <button 
                                        onClick={exportNote} 
                                        className={`px-2 sm:px-3 py-1 rounded-full border ${dark?'bg-slate-900 border-slate-700':'bg-white'} text-[10px] sm:text-xs shadow-sm`}
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>
                            
                            {panel.summary && (
                                <div className={`mt-3 p-2 sm:p-3 rounded-lg sm:rounded-xl ${dark?'bg-slate-800 border-slate-700 text-slate-200':'bg-blue-50 border border-blue-100 text-blue-900'} text-xs sm:text-sm`} style={{wordBreak: 'break-word'}}>
                                    {panel.summary}
                        </div>
                        )}
                            
                        {panel.text && showFullAnswer && (
                                <div className={`mt-3 p-2 sm:p-3 rounded-lg sm:rounded-xl ${dark?'bg-slate-900 border-slate-700':'bg-gray-50 border'} text-xs sm:text-sm max-h-[30vh] sm:max-h-[35vh] lg:max-h-[40vh] overflow-y-auto whitespace-pre-wrap leading-relaxed scrollbar-thin`} style={{wordBreak: 'break-word'}}>
                                    {panel.text}
                                </div>
                        )}
                            
                        {!!panel.references?.length && (
                                <div className="mt-3 sm:mt-4">
                                    <div className="text-xs sm:text-sm font-semibold mb-2">References</div>
                                    <div className="space-y-1 sm:space-y-2 max-h-[25vh] sm:max-h-[30vh] overflow-y-auto scrollbar-thin">
                                    {panel.references.map((r, idx) => (
                                            <details 
                                                key={idx} 
                                                className={`rounded-lg sm:rounded-xl border p-2 sm:p-3 ${dark?'bg-slate-900 border-slate-700 hover:bg-slate-800':'bg-white hover:bg-gray-50'} transition-colors`}
                                            >
                                                <summary className={`cursor-pointer font-medium text-xs sm:text-sm ${dark?'text-teal-300':'text-blue-700'}`} style={{wordBreak: 'break-word'}}>
                                                    <span>{r.case || 'Case'}</span>
                                                    {r.citation && (
                                                        <span className="text-gray-500 text-[10px] sm:text-xs ml-1">
                                                            ({r.citation})
                                                        </span>
                                                    )}
                                                </summary>
                                                <div className={`mt-2 text-xs sm:text-sm ${dark?'text-slate-200':'text-gray-700'}`} style={{wordBreak: 'break-word'}}>
                                                    {r.relevance || ''}
                                                </div>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
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