'use client'
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from "../../../../components/Navbar.jsx";
import LanguageSelector from "../../../../components/LanguageSelector.jsx";
import useAppLanguage from "../../../../components/useAppLanguage.js";

export default function ChatWithDocument() {
    const [documentId, setDocumentId] = useState(null);
    const { language, setLanguage } = useAppLanguage();
    const [chat, setChat] = useState([]);
    const [question, setQuestion] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [typing, setTyping] = useState(false);
    const [fileInfo, setFileInfo] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const audioInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        const id = sessionStorage.getItem('document_id');
        const lang = language;
        setDocumentId(id);
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, []);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [chat, isSending]);

    function handleDrag(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragover') setDragOver(true);
        if (e.type === 'dragleave' || e.type === 'drop') setDragOver(false);
        if (e.type === 'drop' && e.dataTransfer?.files?.length) {
            onFileChosen(e.dataTransfer.files[0]);
        }
    }

    function onFileChosen(file) {
        if (!file) return;
        setFileInfo({ name: file.name, size: file.size, type: file.type });
        uploadFile(file);
    }

    async function uploadFile(file) {
        setIsUploading(true);
        const form = new FormData();
        form.append('file', file);
        try {
            const res = await fetch('/api/analyzer/upload', { method: 'POST', body: form });
            const json = await res.json();
            const id = json?.data?.document_id;
            if (id) {
                sessionStorage.setItem('document_id', id);
                sessionStorage.setItem('language', language);
                setDocumentId(id);
            }
        } catch (e) {
            console.error('Upload failed', e);
        } finally {
            setIsUploading(false);
        }
    }

    async function sendQuestion() {
        if (!question.trim() || !documentId) return;
        const q = question.trim();
        setQuestion('');
        setChat(prev => [...prev, { role: 'user', content: q, ts: new Date() }]);
        setIsSending(true);
        try {
            const res = await fetch('/api/analyzer/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ document_id: documentId, question: q, language })
            });
            const json = await res.json();
            const answer = json?.data?.answer || 'No answer';
            setChat(prev => [...prev, { role: 'assistant', content: answer, ts: new Date() }]);
        } catch (e) {
            console.error('Chat error', e);
        } finally {
            setIsSending(false);
        }
    }

    async function sendVoice() {
        if (!audioInputRef.current?.files?.length || !documentId) return;
        const form = new FormData();
        form.append('audio', audioInputRef.current.files[0]);
        try {
            setIsSending(true);
            const res = await fetch(`/api/analyzer/voice-chat?document_id=${encodeURIComponent(documentId)}`, { method: 'POST', body: form });
            const json = await res.json();
            const response = json?.data?.response || 'No response';
            setChat(prev => [...prev, { role: 'assistant', content: response, ts: new Date() }]);
        } catch (e) {
            console.error('Voice chat error', e);
        } finally { setIsSending(false); }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendQuestion();
        }
    }

    return (
        <>
            <Navbar />
            <div className="lg:ml-[270px] md:ml-[100px] sm:ml-20 ml-20 ] min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center">
                <div className="max-w-6xl mx-auto w-full grid grid-cols-1 gap-6">
                    {/* Upload Section */}
                    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className={`rounded-2xl border border-dashed ${dragOver?'border-sky-500 bg-sky-50/50':'border-gray-300 bg-white/90'} p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrag}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-sky-700 text-white flex items-center justify-center shadow">📄</div>
                            <div>
                                <div className="font-semibold text-gray-900">Upload a document to start chatting</div>
                                <div className="text-sm text-gray-600">Drag & drop or choose a file. Supported: PDF, DOCX, TXT.</div>
                                {fileInfo && (
                                    <div className="text-xs text-gray-700 mt-1">Selected: {fileInfo.name} • {fileInfo.type || 'file'} • {fileInfo.size} bytes</div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e)=>onFileChosen(e.target.files?.[0])} />
                            <button onClick={()=>fileInputRef.current?.click()} disabled={isUploading} className={`px-4 py-2 rounded-xl text-white ${isUploading?'bg-sky-400':'bg-sky-700 hover:bg-sky-800'}`}>{isUploading?'Uploading…':'Choose File'}</button>
                        </div>
                    </motion.div>

                    {/* Chat Section */}
                    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="rounded-3xl bg-white/90 backdrop-blur border border-gray-200 p-6 shadow flex flex-col min-h-[60vh]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-lg font-semibold text-gray-900">Chat with Document</div>
                            <LanguageSelector />
                        </div>

                        <div ref={scrollRef} className="flex-1 overflow-auto rounded-2xl bg-sky-50 border border-gray-200 p-4 space-y-4">
                            <AnimatePresence>
                                {chat.map((m, idx) => (
                                    <motion.div key={idx} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}
                                        className={`max-w-3xl px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role==='user'?'bg-sky-700 text-white ml-auto':'bg-white border border-gray-200 text-gray-800 mr-auto'}`}>
                                        {m.content}
                                    </motion.div>
                                ))}
                                {isSending && (
                                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="w-max px-3 py-1.5 text-xs rounded-full bg-gray-200 text-gray-700">Thinking…</motion.div>
                                )}
                                {typing && (
                                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="w-max px-3 py-1.5 text-xs rounded-full bg-sky-100 text-sky-800">Typing…</motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
                            <textarea value={question} onChange={e=>{setQuestion(e.target.value); setTyping(true); setTimeout(()=>setTyping(false), 800);}} onKeyDown={handleKeyDown} placeholder="Ask a question…" rows={1} className="sm:col-span-9 rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y min-h-[48px]" />
                            <div className="sm:col-span-3 flex items-center gap-3">
                                <button onClick={sendQuestion} disabled={!documentId || isSending} className={`flex-1 px-4 py-3 rounded-xl text-white ${isSending?'bg-sky-400':'bg-sky-700 hover:bg-sky-800'}`}>Send</button>
                                <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" />
                                <button onClick={()=>audioInputRef.current?.click()} title="Send voice" className="px-4 py-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white">🎙️</button>
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">Press Enter to send, Shift+Enter for newline.</div>
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


