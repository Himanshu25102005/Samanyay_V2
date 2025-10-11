'use client'
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from "../../../../components/Navbar.jsx";
import LanguageSelector from "../../../../components/LanguageSelector.jsx";
import useAppLanguage from "../../../../components/useAppLanguage.js";
import { useI18n, getFontClass } from "../../../../components/I18nProvider.jsx";

export default function ChatWithDocument() {
    const [documentId, setDocumentId] = useState(null);
    const { language, setLanguage } = useAppLanguage();
    const { t, lang } = useI18n();
    const [chat, setChat] = useState([]);
    const [question, setQuestion] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [typing, setTyping] = useState(false);
    const [fileInfo, setFileInfo] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const audioInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const scrollRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingIntervalRef = useRef(null);

    function generateMessageId() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 15)}`;
    }

    useEffect(() => {
        const id = sessionStorage.getItem('document_id');
        const lang = language;
        setDocumentId(id);
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, []);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [chat, isSending]);

    // Cleanup recording on component unmount
    useEffect(() => {
        return () => {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.stop();
            }
        };
    }, [isRecording]);

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
        setChat(prev => [...prev, { id: generateMessageId(), role: 'user', content: q, ts: new Date() }]);
        setIsSending(true);
        try {
            const res = await fetch('/api/analyzer/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ document_id: documentId, question: q, language })
            });
            const json = await res.json();
            const answer = json?.data?.answer || 'No answer';
            setChat(prev => [...prev, { id: generateMessageId(), role: 'assistant', content: answer, ts: new Date() }]);
        } catch (e) {
            console.error('Chat error', e);
        } finally {
            setIsSending(false);
        }
    }

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                sendRecordedVoice(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            
            // Start recording timer
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Unable to access microphone. Please check permissions.');
        }
    }

    function stopRecording() {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
                recordingIntervalRef.current = null;
            }
        }
    }

    async function sendRecordedVoice(audioBlob) {
        if (!audioBlob || !documentId) return;
        
        const form = new FormData();
        form.append('audio', audioBlob, 'recording.webm');
        
        try {
            setIsSending(true);
            const res = await fetch(`/api/analyzer/voice-chat?document_id=${encodeURIComponent(documentId)}`, { 
                method: 'POST', 
                body: form 
            });
            const json = await res.json();
            const response = json?.data?.response || 'No response';
            setChat(prev => [...prev, { id: generateMessageId(), role: 'assistant', content: response, ts: new Date() }]);
        } catch (e) {
            console.error('Voice chat error', e);
        } finally { 
            setIsSending(false);
            setRecordingTime(0);
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
            setChat(prev => [...prev, { id: generateMessageId(), role: 'assistant', content: response, ts: new Date() }]);
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
            <div className={`min-h-screen bg-gradient-to-br  from-slate-100 to-slate-200 p-2 sm:p-4 lg:p-6 flex flex-col ${getFontClass(lang)}`}>
                <div className="flex-1 mt-9 w-full max-w-7xl mx-auto">
                    {/* Chat Section */}
                    <motion.div 
                        initial={{opacity:0,y:12}} 
                        animate={{opacity:1,y:0}} 
                        className={`rounded-2xl sm:rounded-3xl bg-white/90 backdrop-blur border ${dragOver ? 'border-sky-500 bg-sky-50/50' : 'border-gray-200'} p-3 sm:p-4 lg:p-6 shadow flex flex-col min-h-0 h-[calc(100vh-120px)]`}
                        onDragOver={handleDrag} 
                        onDragLeave={handleDrag} 
                        onDrop={handleDrag}
                    >
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="text-base sm:text-lg font-semibold text-gray-900">{t('chatWithDoc')}</div>
                            <LanguageSelector />
                        </div>

                        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto rounded-xl sm:rounded-2xl bg-sky-50 border border-gray-200 p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3 lg:space-y-4">
                            <AnimatePresence>
                                {!documentId && chat.length === 0 && (
                                    <motion.div 
                                        initial={{opacity:0,y:8}} 
                                        animate={{opacity:1,y:0}} 
                                        className="flex flex-col items-center justify-center h-full min-h-[400px] text-center"
                                    >
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center mb-6 shadow-sm">
                                            <span className="text-3xl sm:text-4xl">📄</span>
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">{t('uploadToStart')}</h3>
                                        <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-lg leading-relaxed">{t('dragDropHint')}</p>
                                        
                                    </motion.div>
                                )}
                                {chat.map((m, idx) => (
                                    <motion.div key={m.id || `message-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`}
                                        initial={{opacity:0,y:12,scale:0.95}} 
                                        animate={{opacity:1,y:0,scale:1}} 
                                        exit={{opacity:0,y:-12,scale:0.95}} 
                                        transition={{duration:0.3,ease:"easeOut"}}
                                        whileHover={{scale:1.02}}
                                        className={`max-w-full sm:max-w-3xl px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-sm leading-relaxed shadow-sm ${m.role==='user'?'bg-sky-700 text-white ml-auto':'bg-white border border-gray-200 text-gray-800 mr-auto'}`}>
                                        {m.content}
                                    </motion.div>
                                ))}
                                {isSending && (
                                    <motion.div key="thinking-status" initial={{opacity:0}} animate={{opacity:1}} className="w-max px-2 sm:px-3 py-1 sm:py-1.5 text-xs rounded-full bg-gray-200 text-gray-700">{t('thinking')}</motion.div>
                                )}
                                {typing && (
                                    <motion.div key="typing-status" initial={{opacity:0}} animate={{opacity:1}} className="w-max px-2 sm:px-3 py-1 sm:py-1.5 text-xs rounded-full bg-sky-100 text-sky-800">{t('typing')}</motion.div>
                                )}
                                {isRecording && (
                                    <motion.div key="recording-status" initial={{opacity:0}} animate={{opacity:1}} className="w-max px-2 sm:px-3 py-1 sm:py-1.5 text-xs rounded-full bg-red-100 text-red-800 flex items-center gap-1 sm:gap-2">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></div>
                                        <span className="hidden sm:inline">{t('recording')} </span>
                                        <span>{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Upload Status */}
                        {fileInfo && (
                            <div className="mb-3 p-3 bg-sky-50 border border-sky-200 rounded-lg">
                                <div className="text-sm text-sky-800">
                                    <span className="font-medium">{t('selected')}:</span> {fileInfo.name} • {fileInfo.type || t('file')} • {fileInfo.size} {t('bytes')}
                                </div>
                            </div>
                        )}

                        <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3">
                            <div className="sm:col-span-9 flex items-center gap-2">
                                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e)=>onFileChosen(e.target.files?.[0])} />
                                <button 
                                    onClick={()=>fileInputRef.current?.click()} 
                                    disabled={isUploading}
                                    className={`p-2 sm:p-3 rounded-lg sm:rounded-xl text-white transition-all duration-300 hover:scale-105 active:scale-95 ${
                                        isUploading ? 'bg-[#0818A8]/60' : 'bg-[#0818A8] hover:bg-[#0A1BB8]'
                                    }`}
                                    title={isUploading ? t('uploading') : t('uploadDocument')}
                                >
                                    {isUploading ? (
                                        <motion.span 
                                            animate={{ rotate: 360 }} 
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        >
                                            ⏳
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            whileHover={{ scale: 1.1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            ➕
                                        </motion.span>
                                    )}
                                </button>
                                <textarea 
                                    value={question} 
                                    onChange={e=>{setQuestion(e.target.value); setTyping(true); setTimeout(()=>setTyping(false), 800);}} 
                                    onKeyDown={handleKeyDown} 
                                    placeholder={t('askPlaceholder')} 
                                    rows={1} 
                                    className="flex-1 rounded-lg sm:rounded-xl border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y min-h-[44px] sm:min-h-[48px]" 
                                />
                            </div>
                            <div className="sm:col-span-3 flex items-center gap-2 sm:gap-3">
                                <motion.button 
                                    onClick={sendQuestion} 
                                    disabled={!documentId || isSending || isRecording} 
                                    className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-white text-sm sm:text-base ${isSending || isRecording ?'bg-[#0818A8]/60':'bg-[#0818A8] hover:bg-[#0A1BB8]'} transition-all duration-300`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    animate={isSending ? { scale: [1, 1.02, 1] } : {}}
                                    transition={isSending ? { duration: 1.5, repeat: Infinity } : {}}
                                >
                                    {isSending ? (
                                        <motion.span
                                            animate={{ opacity: [1, 0.5, 1] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        >
                                            {t('send')}
                                        </motion.span>
                                    ) : (
                                        t('send')
                                    )}
                                </motion.button>
                                <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" />
                                <div className="flex flex-col items-center gap-1">
                                    <motion.button 
                                        onClick={isRecording ? stopRecording : startRecording} 
                                        disabled={!documentId || isSending}
                                        title={isRecording ? t('stopRecording') : t('startVoiceRecording')}
                                        className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-white transition-all duration-300 text-sm sm:text-base ${
                                            isRecording 
                                                ? 'bg-red-600 hover:bg-red-700' 
                                                : 'bg-[#0818A8] hover:bg-[#0A1BB8]'
                                        } ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        animate={isRecording ? { scale: [1, 1.05, 1] } : {}}
                                        transition={isRecording ? { duration: 1, repeat: Infinity } : {}}
                                    >
                                        {isRecording ? (
                                            <motion.span
                                                animate={{ rotate: [0, 5, -5, 0] }}
                                                transition={{ duration: 0.5, repeat: Infinity }}
                                            >
                                                ⏹️
                                            </motion.span>
                                        ) : (
                                            <motion.span
                                                whileHover={{ scale: 1.1 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                                                    <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" fill="currentColor"/>
                                                    <path d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                    <path d="M12 19V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                    <path d="M8 23H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                </svg>
                                            </motion.span>
                                        )}
                                    </motion.button>
                                    {isRecording && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-xs text-red-600 font-medium flex items-center gap-1"
                                        >
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 0.8, repeat: Infinity }}
                                                className="w-1.5 h-1.5 bg-red-500 rounded-full"
                                            />
                                            {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">{t('pressEnterHint')}</div>
                    </motion.div>
                </div>
            </div>

            <style jsx>{`
                @media (max-width: 1024px) { 
                    .ml-\[280px\] { margin-left: 80px; } 
                }
                @media (max-width: 768px) { 
                    .ml-\[280px\] { margin-left: 70px; } 
                }
                @media (max-width: 640px) { 
                    .ml-\[280px\] { margin-left: 0; padding: 0.5rem; } 
                }
                @media (max-width: 480px) {
                    .ml-\[280px\] { padding: 0.25rem; }
                }
            `}</style>
        </>
    );
}


