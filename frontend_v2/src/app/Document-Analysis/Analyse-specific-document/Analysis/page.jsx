'use client'
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from "../../../../../components/Navbar.jsx";
import LanguageSelector from "../../../../../components/LanguageSelector.jsx";
import useAppLanguage from "../../../../../components/useAppLanguage.js";

export default function AnalysisPage() {
    const router = useRouter();
    const [documentId, setDocumentId] = useState(null);
    const { language, setLanguage } = useAppLanguage();
    const [analysis, setAnalysis] = useState(null);
    const [loadingAnalysis, setLoadingAnalysis] = useState(true);
    const [loadingChat, setLoadingChat] = useState(false);
    const [expandedChat, setExpandedChat] = useState(false);
    const [docInfo, setDocInfo] = useState(null);
    const [docPreview, setDocPreview] = useState('');
    const [question, setQuestion] = useState('');
    const [chat, setChat] = useState([]);
    const audioRef = useRef(null);

    useEffect(() => {
        const id = sessionStorage.getItem('document_id');
        const lang = language;
        setDocumentId(id);
        try {
            const info = sessionStorage.getItem('document_info');
            if (info) setDocInfo(JSON.parse(info));
            const preview = sessionStorage.getItem('document_preview') || '';
            setDocPreview(preview);
        } catch {}
        if (!id) return;

        // Step 3: Fetch Document Analysis
        fetch('/api/analyzer/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ document_id: id, language: lang })
        }).then(r => r.json()).then(json => {
            setAnalysis(json?.data?.analysis);
        }).catch(e => console.error('Analyze error', e)).finally(()=>setLoadingAnalysis(false));
    }, []);

    async function sendTextQuestion() {
        if (!question.trim() || !documentId) return;
        const q = question.trim();
        setQuestion('');
        setChat(prev => [...prev, { role: 'user', content: q }]);
        try {
            setLoadingChat(true);
            const res = await fetch('/api/analyzer/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ document_id: documentId, question: q, language })
            });
            const json = await res.json();
            const answer = json?.data?.answer || 'No answer';
            setChat(prev => [...prev, { role: 'assistant', content: answer }]);
        } catch (e) {
            console.error('Chat error', e);
        } finally { setLoadingChat(false); }
    }

    async function sendVoice() {
        if (!audioRef.current || !audioRef.current.files?.length || !documentId) return;
        const form = new FormData();
        form.append('audio', audioRef.current.files[0]);
        try {
            const res = await fetch(`/api/analyzer/voice-chat?document_id=${encodeURIComponent(documentId)}`, { method: 'POST', body: form });
            const json = await res.json();
            const response = json?.data?.response || 'No response';
            setChat(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (e) {
            console.error('Voice chat error', e);
        }
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

    return (
        <>
            <Navbar />
            <div className="ml-[280px] min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center">
                <div className={`max-w-7xl mx-auto w-full grid grid-cols-1 ${expandedChat ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-8`}>
                    {/* Chat Panel (bigger) */}
                    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.45,ease:[0.22,1,0.36,1]}} className="lg:col-span-2 rounded-3xl bg-white/80 backdrop-blur border border-gray-200 p-8 shadow-xl flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Chat with Document</h2>
                            <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">Document ID: <span className="font-mono text-gray-700 truncate max-w-[220px]">{documentId || '-'}</span></div>
                        </div>
                        <div className="flex-1 overflow-auto space-y-6 pr-3 rounded-2xl bg-gray-50 border border-gray-200 p-5 min-h-[60vh]">
                            {chat.length === 0 && (
                                <div className="text-gray-500 text-sm">Ask a question about your document to get started.</div>
                            )}
                            {chat.map((m, idx) => {
                                const isRight = idx % 2 === 1;
                                const bubbleColor = isRight ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800';
                                const align = isRight ? 'ml-auto' : 'mr-auto';
                                return (
                                    <div
                                        key={idx}
                                        className={`max-w-3xl px-4 py-3 md:px-5 md:py-4 rounded-2xl text-sm leading-relaxed shadow-sm ${bubbleColor} ${align} break-words`}
                                    >
                                        {m.content}
                                    </div>
                                );
                            })}
                            {loadingChat && (
                                <div className="text-gray-500 text-sm">Thinking…</div>
                            )}
                        </div>
                        <div className="mt-4 grid grid-cols-1 lg:grid-cols-5 gap-3">
                            <input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ask a question..." className="lg:col-span-4 rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <button onClick={sendTextQuestion} className="rounded-xl bg-blue-600 text-white text-base hover:bg-blue-700 px-4 py-3">Send</button>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                            <input ref={audioRef} type="file" accept="audio/*" className="text-sm" />
                            <button onClick={sendVoice} className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">Send Voice</button>
                            <button onClick={()=>setExpandedChat(v=>!v)} className="px-4 py-2 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300">{expandedChat?'Shrink Chat':'Expand Chat'}</button>
                        </div>
                    </motion.div>

                    {/* Analysis Panel (thin, spaced sections) */}
                    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.45,ease:[0.22,1,0.36,1], delay:0.05}} className="rounded-3xl bg-white/90 backdrop-blur border border-gray-200 p-7 shadow-xl h-fit">
                        <div className="flex items-center justify-between mb-5">
                            <h1 className="text-xl font-semibold text-gray-900">Analysis</h1>
                            <LanguageSelector />
                        </div>
                        {loadingAnalysis ? (
                            <div className="text-gray-500 text-sm">Analyzing document…</div>
                        ) : analysis ? (
                            <div className="space-y-5">
                                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100">
                                    <h2 className="text-xs font-semibold text-blue-900 tracking-wide">SUMMARY</h2>
                                    <p className="text-gray-900 mt-2 text-sm leading-relaxed">{analysis.summary}</p>
                                    <div className="mt-3 flex gap-2">
                                        <button onClick={()=>navigator.clipboard.writeText(analysis.summary || '')} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700">Copy</button>
                                        <button onClick={()=>downloadText('summary.txt', analysis.summary || '')} className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-800 text-xs hover:bg-gray-300">Download</button>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100">
                                    <h2 className="text-xs font-semibold text-indigo-900 tracking-wide">KEY TOPICS</h2>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {(analysis.key_topics || []).map((t,i)=>(
                                            <span key={i} className="px-2.5 py-1 rounded-full text-xs bg-white border border-indigo-200 text-indigo-800 shadow-sm">{t}</span>
                                        ))}
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <button onClick={()=>navigator.clipboard.writeText((analysis.key_topics||[]).join(', '))} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs hover:bg-indigo-700">Copy</button>
                                        <button onClick={()=>downloadText('key_topics.txt', (analysis.key_topics||[]).join(', '))} className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-800 text-xs hover:bg-gray-300">Download</button>
                                    </div>
                                </div>
                                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-700">
                                    Language: <span className="font-medium text-gray-900">{analysis.language}</span>
                                </div>
                                {(docInfo || docPreview) && (
                                    <div className="p-4 rounded-2xl bg-white border border-gray-200">
                                        <h3 className="text-xs font-semibold text-gray-900 mb-2">Document</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-12 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-gray-500">📄</div>
                                            <div className="text-xs text-gray-700">
                                                <div className="font-medium">{docInfo?.filename || 'Unknown file'}</div>
                                                <div className="text-gray-500">{docInfo?.type || ''} {docInfo?.size ? `• ${docInfo.size} bytes` : ''}</div>
                                            </div>
                                        </div>
                                        {docPreview && (
                                            <p className="text-xs text-gray-600 mt-2 line-clamp-3">{docPreview}</p>
                                        )}
                                    </div>
                                )}
                                <div className="pt-2 border-t border-gray-200">
                                    <span className="text-xs text-gray-600 mr-2">Rate accuracy:</span>
                                    {[1,2,3,4,5].map(r=> (
                                        <button key={r} className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-xs mr-1">{r}</button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-500 text-sm">Fetching analysis...</div>
                        )}
                    </motion.div>
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


