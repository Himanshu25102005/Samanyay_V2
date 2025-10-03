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
    const scrollRef = useRef(null);

    useEffect(() => {
        fetch('/api/legal-research/health-check')
            .then(r => r.json()).then(() => setHealth('running'))
            .catch(() => setHealth('unreachable'));
    }, []);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [chat, isSending]);

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

    return (
        <>
            <Navbar />
            <div className={`ml-[280px] min-h-screen ${dark?'bg-[#0b1220] text-slate-100':'bg-gradient-to-br from-white via-[#F9FAFB] to-blue-50 text-gray-900'} p-6 flex items-start justify-center`}>
                <div className="w-full max-w-[1200px]">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={()=>history.back()} className={`px-3 py-2 rounded-lg border ${dark?'bg-slate-800 border-slate-700 hover:bg-slate-700':'bg-white hover:bg-gray-50'} shadow-sm`}>← Back</button>
                            <div className="relative">
                                <h1 className={`text-4zxl md:text-4xl font-extrabold tracking-tight ${dark?'text-slate-100':'text-slate-900'}`}>Legal Research</h1>
                                <span className="absolute left-0 -bottom-1 h-1 w-3/4 bg-gradient-to-r from-blue-600 to-teal-500 rounded-full"></span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded ${health==='running'?(dark?'bg-green-900 text-green-200':'bg-green-100 text-green-700'):(dark?'bg-slate-800 text-slate-300':'bg-gray-100 text-gray-600')}`}>{health}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={()=>setDark(d=>!d)} className={`px-3 py-2 rounded-lg border shadow-sm ${dark?'bg-slate-900 border-slate-700':'bg-white'}`}>{dark?'Dark':'Light'}</button>
                            <LanguageSelector />
                        </div>
                    </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {/* Chat column */}
                    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={`rounded-2xl ${dark?'bg-[#0f172a] border-slate-700':'bg-white/90'} border-2 ${dark?'border-slate-700':'border-blue-100'} shadow-lg p-4 flex flex-col min-h-[65vh] backdrop-blur` }>
                        <div ref={scrollRef} className="flex-1 overflow-auto space-y-4 p-2">
                            <AnimatePresence>
                                {chat.map((m, i) => (
                                    <motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
                                        className={`group max-w-[85%] px-4 py-3 rounded-2xl shadow ${i%2? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white ml-auto':'bg-white/90 border border-blue-100 text-slate-900 mr-auto'}`}>
                                        <div className="flex items-start gap-3">
                                            {!i%2 && <div className="hidden"/>}
                                            <div className="leading-relaxed">{m.content}</div>
                                        </div>
                                        <div className={`opacity-0 group-hover:opacity-100 transition text-[10px] mt-1 ${i%2?'text-white/80':'text-blue-700/70'}`}>{m.ts ? new Date(m.ts).toLocaleTimeString() : ''}</div>
                                    </motion.div>
                                ))}
                                {isSending && (
                                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="w-max px-3 py-1.5 text-xs rounded-full bg-gray-200 text-gray-700">Processing…</motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
                        <div className="mt-3 grid grid-cols-12 gap-2 items-stretch">
                            <textarea value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); } }} placeholder="Type your legal question…" rows={1} className={`col-span-12 md:col-span-7 h-full rounded-xl border-2 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[44px] ${dark?'bg-slate-900 border-slate-700 text-slate-100':'bg-white border-blue-100 hover:border-blue-200'}`} />
                            <div className={`col-span-12 md:col-span-3 h-full min-h-[44px] flex items-center justify-center ${dark?'bg-slate-900 border-slate-700':'bg-white'} rounded-xl border shadow px-1 py-1 overflow-hidden`}>
                                <div className="flex items-center flex-nowrap gap-1 w-full justify-center">
                                    {['detailed','short'].map(v => (
                                        <button key={v} onClick={()=>setAnswerType(v)} className={`px-2 md:px-3 py-1.5 text-xs md:text-sm rounded-full transition-all whitespace-nowrap ${answerType===v?(dark?'bg-teal-600 text-white shadow':'bg-blue-600 text-white shadow'):(dark?'text-slate-200 hover:bg-slate-800':'text-gray-700 hover:bg-gray-50')}`}>{v==='detailed'?'Detailed':'Short'}</button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={send} className={`col-span-12 md:col-span-2 h-full min-h-[44px] rounded-xl ${dark?'bg-teal-600 hover:bg-teal-700':'bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1e4ed8] hover:to-[#2563eb]'} text-white font-semibold shadow-md`}>Send</button>
                        </div>
                        <div className="mt-3 flex items-center justify-end gap-3 text-sm">
                            <button onClick={clearChat} className={`inline-flex items-center h-9 px-3 rounded-lg border ${dark?'bg-slate-900 border-slate-700':'bg-white'} shadow-sm hover:opacity-90`}>Clear chat</button>
                            <button onClick={exportChat} className={`inline-flex items-center h-9 px-3 rounded-lg border ${dark?'bg-slate-900 border-slate-700':'bg-white'} shadow-sm hover:opacity-90`}>Download</button>
                        </div>
                    </motion.div>

                    {/* Answer panel */}
                    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={`rounded-2xl ${dark?'bg-[#0f172a] border-slate-700 text-slate-100':'bg-white/90'} border-2 ${dark?'border-slate-700':'border-blue-100'} shadow-lg p-4 h-fit backdrop-blur`}>
                        <div className="flex items-center justify-between border-b pb-2">
                            <div className="text-xl font-bold tracking-tight">{panel.title || 'Answer'}</div>
                            <div className="flex items-center gap-2">
                                <button onClick={()=>setShowFullAnswer(s=>!s)} className={`px-3 py-1.5 rounded-full border ${dark?'bg-slate-900 border-slate-700':'bg-white'} text-xs shadow-sm`}>{showFullAnswer?'Show summary':'Show full'}</button>
                                <button onClick={exportNote} className={`px-3 py-1.5 rounded-full border ${dark?'bg-slate-900 border-slate-700':'bg-white'} text-xs shadow-sm`}>Download note</button>
                            </div>
                        </div>
                        {panel.summary && (
                            <div className={`mt-3 p-3 rounded-xl ${dark?'bg-slate-800 border-slate-700 text-slate-200':'bg-blue-50 border border-blue-100 text-blue-900'} text-sm`}>{panel.summary}</div>
                        )}
                        {panel.text && showFullAnswer && (
                            <div className={`mt-3 p-3 rounded-xl ${dark?'bg-slate-900 border-slate-700':'bg-gray-50 border'} text-sm max-h-[40vh] overflow-auto whitespace-pre-wrap leading-relaxed`}>{panel.text}</div>
                        )}
                        {!!panel.references?.length && (
                            <div className="mt-4">
                                <div className="text-sm font-semibold mb-2">References</div>
                                <div className="space-y-2">
                                    {panel.references.map((r, idx) => (
                                        <details key={idx} className={`rounded-xl border p-3 ${dark?'bg-slate-900 border-slate-700 hover:bg-slate-800':'bg-white hover:bg-gray-50'} transition-colors`}>
                                            <summary className={`cursor-pointer font-medium ${dark?'text-teal-300':'text-blue-700'}`}>{r.case || 'Case'} <span className="text-gray-500">{r.citation || ''}</span></summary>
                                            <div className={`mt-2 text-sm ${dark?'text-slate-200':'text-gray-700'}`}>{r.relevance || ''}</div>
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
