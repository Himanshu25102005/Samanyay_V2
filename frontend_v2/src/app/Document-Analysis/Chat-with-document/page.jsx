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
            setChat(prev => [...prev, { role: 'assistant', content: response, ts: new Date() }]);
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
            <div className={`lg:ml-[270px] md:ml-[100px] sm:ml-20 ml-20 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-2 sm:p-4 lg:p-6 ${getFontClass(lang)}`}>
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
                    {/* Upload Section */}
                    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className={`rounded-xl border border-dashed ${dragOver?'border-sky-500 bg-sky-50/50':'border-gray-300 bg-white/90'} p-3 sm:p-4 lg:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4`} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrag}>
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sky-700 text-white flex items-center justify-center shadow">📄</div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 text-sm sm:text-base">{t('uploadToStart')}</div>
                                <div className="text-xs sm:text-sm text-gray-600">{t('dragDropHint')}</div>
                                {fileInfo && (
                                    <div className="text-xs text-gray-700 mt-1 truncate">{t('selected')}: {fileInfo.name} • {fileInfo.type || t('file')} • {fileInfo.size} {t('bytes')}</div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e)=>onFileChosen(e.target.files?.[0])} />
                            <button onClick={()=>fileInputRef.current?.click()} disabled={isUploading} className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-white text-sm sm:text-base ${isUploading?'bg-sky-400':'bg-sky-700 hover:bg-sky-800'} transition-colors`}>{isUploading?t('uploading'):t('chooseFile')}</button>
                        </div>
                    </motion.div>

                    {/* Chat Section */}
                    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="rounded-2xl sm:rounded-3xl bg-white/90 backdrop-blur border border-gray-200 p-3 sm:p-4 lg:p-6 shadow flex flex-col min-h-[50vh] sm:min-h-[60vh] lg:min-h-[70vh]">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="text-base sm:text-lg font-semibold text-gray-900">{t('chatWithDoc')}</div>
                            <LanguageSelector />
                        </div>

                        <div ref={scrollRef} className="flex-1 overflow-auto rounded-xl sm:rounded-2xl bg-sky-50 border border-gray-200 p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3 lg:space-y-4">
                            <AnimatePresence>
                                {chat.map((m, idx) => (
                                    <motion.div key={idx} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}
                                        className={`max-w-full sm:max-w-3xl px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-sm leading-relaxed shadow-sm ${m.role==='user'?'bg-sky-700 text-white ml-auto':'bg-white border border-gray-200 text-gray-800 mr-auto'}`}>
                                        {m.content}
                                    </motion.div>
                                ))}
                                {isSending && (
                                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="w-max px-2 sm:px-3 py-1 sm:py-1.5 text-xs rounded-full bg-gray-200 text-gray-700">{t('thinking')}</motion.div>
                                )}
                                {typing && (
                                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="w-max px-2 sm:px-3 py-1 sm:py-1.5 text-xs rounded-full bg-sky-100 text-sky-800">{t('typing')}</motion.div>
                                )}
                                {isRecording && (
                                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="w-max px-2 sm:px-3 py-1 sm:py-1.5 text-xs rounded-full bg-red-100 text-red-800 flex items-center gap-1 sm:gap-2">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></div>
                                        <span className="hidden sm:inline">{t('recording')} </span>
                                        <span>{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3">
                            <textarea value={question} onChange={e=>{setQuestion(e.target.value); setTyping(true); setTimeout(()=>setTyping(false), 800);}} onKeyDown={handleKeyDown} placeholder={t('askPlaceholder')} rows={1} className="sm:col-span-9 rounded-lg sm:rounded-xl border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y min-h-[44px] sm:min-h-[48px]" />
                            <div className="sm:col-span-3 flex items-center gap-2 sm:gap-3">
                                <button onClick={sendQuestion} disabled={!documentId || isSending || isRecording} className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-white text-sm sm:text-base ${isSending || isRecording ?'bg-sky-400':'bg-sky-700 hover:bg-sky-800'} transition-colors`}>{t('send')}</button>
                                <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" />
                                <div className="flex flex-col items-center gap-1">
                                    <button 
                                        onClick={isRecording ? stopRecording : startRecording} 
                                        disabled={!documentId || isSending}
                                        title={isRecording ? t('stopRecording') : t('startVoiceRecording')}
                                        className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-white transition-all duration-200 text-sm sm:text-base ${
                                            isRecording 
                                                ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                                                : 'bg-sky-700 hover:bg-sky-800'
                                        } ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isRecording ? '⏹️' : '🎙️'}
                                    </button>
                                    {isRecording && (
                                        <div className="text-xs text-red-600 font-medium">
                                            {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                                        </div>
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


