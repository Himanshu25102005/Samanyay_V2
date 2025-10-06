"use client";
import { useEffect, useRef, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import LanguageSelector from "../../../../components/LanguageSelector.jsx";
import Navbar from "../../../../components/Navbar.jsx";
import { useI18n } from "../../../../components/I18nProvider.jsx";
import { motion, AnimatePresence } from "framer-motion";

// Component that uses useSearchParams - needs to be wrapped in Suspense
function SearchParamsHandler({ onParamsLoaded }) {
  const params = useSearchParams();
  const type = params.get("type") || "Document";
  const initialDid = params.get("did") || "";
  
  // Use useEffect to call the callback after render
  useEffect(() => {
    onParamsLoaded({ type, initialDid });
  }, [type, initialDid, onParamsLoaded]);
  
  return null; // This component doesn't render anything
}

function NewDraftContent({ type, initialDid }) {
  const { t } = useI18n();

  const [documentId, setDocumentId] = useState(initialDid || null);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [voiceResult, setVoiceResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recording, setRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  
  // New state for mobile scroll hint
  const [showScrollHint, setShowScrollHint] = useState(true);
  const chatSectionRef = useRef(null);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.durationInterval) {
        clearInterval(mediaRecorderRef.current.durationInterval);
      }
    };
  }, []);

  // Hide scroll hint on mobile when user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 1024 && showScrollHint) {
        setShowScrollHint(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showScrollHint]);

  // Auto-scroll to chat on mobile after hint is clicked
  const scrollToChat = () => {
    setShowScrollHint(false);
    chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  async function uploadSupportingDoc(file) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/Drafting-Assistant/api/drafting/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data?.data?.document_id) setDocumentId(data.data.document_id);
    } finally {
      setUploading(false);
    }
  }

  function onChooseFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = () => {
      const f = input.files?.[0];
      if (f) uploadSupportingDoc(f);
    };
    input.click();
  }

  async function startRecording() {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        console.log('Recording stopped, audio blob created:', blob.size, 'bytes');
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setRecording(true);
      setRecordingDuration(0);
      setAudioBlob(null);
      
      // Start duration timer
      const durationInterval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      // Store interval reference for cleanup
      mediaRecorderRef.current.durationInterval = durationInterval;
      
      console.log('Recording started');
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please check microphone permissions.');
    }
  }

  function stopRecording() {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    
    mr.stop();
    setRecording(false);
    
    // Clear duration interval
    if (mr.durationInterval) {
      clearInterval(mr.durationInterval);
    }
    
    console.log('Recording stopped');
  }

  async function processVoiceRecording() {
    if (!audioBlob) {
      setError('No audio recording available. Please record audio first.');
      return;
    }
    
    setIsProcessingVoice(true);
    setError(null);
    
    try {
      const fd = new FormData();
      fd.append("audio", audioBlob, "recording.webm");
      if (documentId) fd.append("document_id", documentId);
      
      console.log('Sending voice recording to API...');
      const res = await fetch("/Drafting-Assistant/api/drafting/voice-chat?format=docx", { 
        method: "POST", 
        body: fd 
      });
      
      if (!res.ok) {
        throw new Error(`Voice processing failed: ${res.status} ${res.statusText}`);
      }
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { status: 'error', message: text };
      }
      
      if (data.status === 'error') {
        throw new Error(data.message || 'Voice processing failed');
      }
      
      setVoiceResult(data?.data || null);
      console.log('Voice processing successful:', data);
    } catch (err) {
      console.error('Voice processing error:', err);
      setError(err.message);
    } finally {
      setIsProcessingVoice(false);
    }
  }

  async function generateNewDraft() {
    if (!prompt.trim() && !audioBlob) {
      setError('Please provide either text instructions or record voice instructions.');
      return;
    }
    
    setSubmitting(true);
    try {
      setError(null);
      
      if (audioBlob) {
        // Use voice recording for generation
        const fd = new FormData();
        fd.append("audio", audioBlob, "recording.webm");
        if (documentId) fd.append("document_id", documentId);
        if (prompt.trim()) fd.append("prompt", prompt);
        
        console.log('Generating draft with voice recording...');
        const res = await fetch("/Drafting-Assistant/api/drafting/voice-chat?format=docx", { 
          method: "POST", 
          body: fd 
        });
        
        if (!res.ok) {
          throw new Error(`Voice generation failed: ${res.status} ${res.statusText}`);
        }
        
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = { status: 'error', message: text }; }
        
        if (data.status === 'error') {
          throw new Error(data.message || 'Voice generation failed');
        }
        
        setResult(data?.data || null);
      } else {
        // Use text prompt for generation
        const body = JSON.stringify({ prompt, document_id: documentId || null });
        const res = await fetch("/Drafting-Assistant/api/drafting/new?format=docx", { 
          method: "POST", 
          headers: { "content-type": "application/json" }, 
          body 
        });
        
        if (!res.ok) {
          throw new Error(`Text generation failed: ${res.status} ${res.statusText}`);
        }
        
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = { status: 'error', message: text }; }
        
        if (data.status === 'error') {
          throw new Error(data.message || 'Text generation failed');
        }
        
        setResult(data?.data || null);
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function triggerDownload(filename) {
    const res = await fetch(`/Drafting-Assistant/api/drafting/download/${encodeURIComponent(filename)}`);
    const data = await res.json();
    console.log("download:", data);
    alert("File downloaded");
  }

  return (
    <>
      <Navbar />
      <div className="lg:ml-[265px] md:ml-[100px] sm:ml-20 ml-20 ] min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
        <div className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-sky-800">{t('draftingAssistant')}</h1>
            <LanguageSelector />
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6">
          <div className="mb-4">
            <div className="text-sm text-slate-600">{t('selectedType')}</div>
            <div className="text-lg font-medium text-slate-800">{type}</div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Left Side - General Guidance (Hidden on mobile by default, collapsible) */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24">
                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="font-semibold text-slate-800 mb-3 text-base flex items-center gap-2">
                    <svg className="w-5 h-5 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    General Guidance
                  </div>
                  <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm leading-relaxed">
                    <li>Include purpose, involved parties, timelines, terms, and signatures.</li>
                    <li>Be precise, unambiguous, and consistent in definitions.</li>
                    <li>Add governing law, dispute resolution, and termination clauses.</li>
                    <li>Consider confidentiality and non-disclosure requirements.</li>
                    <li>Specify payment terms and conditions clearly.</li>
                    <li>Include force majeure clauses for unforeseen events.</li>
                    <li>Define dispute resolution mechanisms.</li>
                    <li>Ensure compliance with applicable laws.</li>
                  </ul>
                </section>
              </div>
            </div>

            {/* Right Side - Chat Interface */}
            <div className="lg:col-span-9 order-1 lg:order-2" ref={chatSectionRef}>
              {/* Mobile Scroll Hint */}
              <AnimatePresence>
                {showScrollHint && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="lg:hidden mb-4 relative"
                  >
                    <div 
                      onClick={scrollToChat}
                      className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl p-4 shadow-lg cursor-pointer active:scale-95 transition-transform"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-base mb-1">Start Drafting Below 👇</div>
                          <div className="text-sm text-sky-100">Tap here to jump to the chat interface</div>
                        </div>
                        <motion.div
                          animate={{ y: [0, 8, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="ml-3"
                        >
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <section className="rounded-xl border border-slate-200 bg-white flex flex-col shadow-sm" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
                {/* Chat Header */}
                <div className="p-4 sm:p-5 border-b border-slate-200 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-base sm:text-lg">Draft Generation Chat</div>
                      <div className="text-xs sm:text-sm text-slate-600 truncate">Get help with your document drafting</div>
                    </div>
                  </div>
                </div>

                {/* Chat Messages Area - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0">
                  {voiceResult && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-sm font-medium text-blue-900 mb-1">Voice Prompt Result</div>
                            <div className="text-sm text-blue-800 whitespace-pre-wrap break-words">{voiceResult.transcript}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-green-50 rounded-lg p-3">
                            <div className="text-sm font-medium text-green-900 mb-2">Generated Draft</div>
                            <div className="text-sm text-green-800 whitespace-pre-wrap max-h-[400px] sm:max-h-[500px] overflow-y-auto break-words">{voiceResult.draft}</div>
                            {voiceResult.download_url && voiceResult.filename && (
                              <div className="mt-3">
                                <button 
                                  onClick={()=>triggerDownload(voiceResult.filename)} 
                                  className="text-xs sm:text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  Download Draft
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {result && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-green-900 mb-2">Generated Draft</div>
                          <div className="text-sm text-green-800 whitespace-pre-wrap max-h-[400px] sm:max-h-[500px] overflow-y-auto break-words">{result.draft}</div>
                          {result.download_url && result.filename && (
                            <div className="mt-3">
                              <button 
                                onClick={()=>triggerDownload(result.filename)} 
                                className="text-xs sm:text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Download Draft
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {!voiceResult && !result && (
                    <div className="flex items-center justify-center h-full text-slate-500">
                      <div className="text-center px-4">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </motion.div>
                        <p className="text-base sm:text-lg font-medium text-slate-600 mb-2">Ready to Start</p>
                        <p className="text-sm text-slate-500">Begin generating your draft to see results here</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input Area - Fixed at bottom */}
                <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-xs sm:text-sm mb-3"
                    >
                      {String(error)}
                    </motion.div>
                  )}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Instructions</label>
                      <textarea 
                        value={prompt} 
                        onChange={(e)=>setPrompt(e.target.value)} 
                        rows={2} 
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm resize-none" 
                        placeholder="Describe the draft you want..." 
                      />
                    </div>
                    
                    {/* All Buttons - Responsive Layout */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Upload Document Button */}
                      <motion.button 
                        whileTap={{ scale: 0.95 }} 
                        onClick={onChooseFile} 
                        className="rounded-lg bg-slate-600 text-white px-3 py-2 hover:bg-slate-700 flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="hidden sm:inline">Upload</span>
                        <span className="sm:hidden">📄</span>
                      </motion.button>
                      
                      {/* Voice Recording Button */}
                      {!recording ? (
                        <motion.button 
                          whileTap={{ scale: 0.95 }} 
                          onClick={startRecording} 
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                          </svg>
                          <span className="hidden sm:inline">Record</span>
                          <span className="sm:hidden">🎤</span>
                        </motion.button>
                      ) : (
                        <motion.button 
                          whileTap={{ scale: 0.95 }} 
                          onClick={stopRecording} 
                          className="rounded-lg bg-red-600 text-white px-3 py-2 hover:bg-red-700 flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors"
                        >
                          <div className="w-3 h-3 bg-white rounded-sm"></div>
                          Stop ({recordingDuration}s)
                        </motion.button>
                      )}
                      
                      {/* Process Voice Button */}
                      {audioBlob && !recording && (
                        <motion.button 
                          whileTap={{ scale: 0.95 }} 
                          onClick={processVoiceRecording}
                          disabled={isProcessingVoice}
                          className="rounded-lg bg-green-600 text-white px-3 py-2 hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors"
                        >
                          {isProcessingVoice ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span className="hidden sm:inline">Processing...</span>
                              <span className="sm:hidden">⏳</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                              <span className="hidden sm:inline">Process</span>
                              <span className="sm:hidden">▶️</span>
                            </>
                          )}
                        </motion.button>
                      )}
                      
                      {/* Generate Draft Button */}
                      <motion.button 
                        whileTap={{ scale: 0.95 }} 
                        disabled={submitting || (!prompt.trim() && !audioBlob)} 
                        onClick={generateNewDraft} 
                        className="rounded-lg bg-sky-600 text-white px-4 py-2 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-initial justify-center"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            <span>Generate Draft</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                    
                    {/* Status Indicators */}
                    <div className="flex items-center gap-3 sm:gap-4 text-xs flex-wrap">
                      {uploading && (
                        <span className="text-slate-600 flex items-center gap-1">
                          <div className="w-3 h-3 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                          Uploading…
                        </span>
                      )}
                      {documentId && (
                        <span className="text-slate-700 truncate max-w-[200px] sm:max-w-none">
                          Doc ID: <span className="font-mono text-xs">{documentId.substring(0, 8)}...</span>
                        </span>
                      )}
                      {recording && (
                        <div className="flex items-center gap-2 text-red-600 font-medium">
                          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                          <span>Recording... ({recordingDuration}s)</span>
                        </div>
                      )}
                      {audioBlob && !recording && (
                        <div className="flex items-center gap-2 text-green-600 font-medium">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Ready ({Math.round(audioBlob.size / 1024)}KB)</span>
                        </div>
                      )}
                      {submitting && (
                        <span className="text-slate-600 flex items-center gap-1">
                          <div className="w-3 h-3 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                          Creating your draft...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default function NewDraftPage() {
  const [params, setParams] = useState({ type: "Document", initialDid: "" });
  const [paramsLoaded, setParamsLoaded] = useState(false);

  const handleParamsLoaded = useCallback(({ type, initialDid }) => {
    setParams({ type, initialDid });
    setParamsLoaded(true);
  }, []);

  return (
    <>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-slate-600 font-medium">Loading...</div>
          </div>
        </div>
      }>
        <SearchParamsHandler onParamsLoaded={handleParamsLoaded} />
      </Suspense>
      {paramsLoaded && <NewDraftContent type={params.type} initialDid={params.initialDid} />}
    </>
  );
}