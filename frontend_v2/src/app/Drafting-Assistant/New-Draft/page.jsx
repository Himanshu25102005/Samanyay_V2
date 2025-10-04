"use client";
import { useEffect, useRef, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import LanguageSelector from "../../../../components/LanguageSelector.jsx";
import Navbar from "../../../../components/Navbar.jsx";
import { useI18n } from "../../../../components/I18nProvider.jsx";
import { motion } from "framer-motion";

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

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.durationInterval) {
        clearInterval(mediaRecorderRef.current.durationInterval);
      }
    };
  }, []);

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
      <div className="ml-[280px] min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <div className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold text-sky-800">{t('draftingAssistant')}</h1>
          <LanguageSelector />
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <div>
          <div className="text-sm text-slate-600">{t('selectedType')}</div>
          <div className="text-lg font-medium text-slate-800">{type}</div>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="font-medium text-slate-800 mb-2">General Guidance</div>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li>Include purpose, involved parties, timelines, terms, signatures.</li>
            <li>Be precise, unambiguous, and consistent in definitions.</li>
            <li>Add governing law, dispute resolution, and termination clauses.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          {error && <div className="rounded-md border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">{String(error)}</div>}
          <div className="flex items-center gap-3">
            <button onClick={onChooseFile} className="rounded-lg bg-sky-600 text-white px-4 py-2 hover:bg-sky-700">{t('uploadSupportingDocument')}</button>
            {uploading && <span className="text-sm text-slate-600">Uploading…</span>}
            {documentId && <span className="text-sm text-slate-700">document_id: <span className="font-mono">{documentId}</span></span>}
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">{t('writeYourInstructions')}</label>
            <textarea value={prompt} onChange={(e)=>setPrompt(e.target.value)} rows={6} className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Describe the draft you want..." />
          </div>
          {/* Voice Recording Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {!recording ? (
                <motion.button 
                  whileTap={{ scale: 0.98 }} 
                  onClick={startRecording} 
                  className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  Start Recording
                </motion.button>
              ) : (
                <motion.button 
                  whileTap={{ scale: 0.98 }} 
                  onClick={stopRecording} 
                  className="rounded-lg bg-red-600 text-white px-4 py-2 hover:bg-red-700 flex items-center gap-2"
                >
                  <div className="w-4 h-4 bg-white rounded-sm"></div>
                  Stop Recording ({recordingDuration}s)
                </motion.button>
              )}
              
              {audioBlob && !recording && (
                <motion.button 
                  whileTap={{ scale: 0.98 }} 
                  onClick={processVoiceRecording}
                  disabled={isProcessingVoice}
                  className="rounded-lg bg-green-600 text-white px-4 py-2 hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessingVoice ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Process Voice
                    </>
                  )}
                </motion.button>
              )}
            </div>
            
            {/* Recording Status */}
            {recording && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <span>Recording in progress... ({recordingDuration}s)</span>
              </div>
            )}
            
            {audioBlob && !recording && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Audio recorded ({Math.round(audioBlob.size / 1024)}KB) - Ready to process</span>
              </div>
            )}
          </div>
          
          {/* Generate Button */}
          <div className="flex items-center gap-3">
            <motion.button 
              whileTap={{ scale: 0.98 }} 
              disabled={submitting || (!prompt.trim() && !audioBlob)} 
              onClick={generateNewDraft} 
              className="rounded-lg bg-sky-600 text-white px-4 py-2 hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Generate New Draft
                </>
              )}
            </motion.button>
            
            {submitting && (
              <span className="text-sm text-slate-600">Creating your draft...</span>
            )}
          </div>
        </section>

        {voiceResult && (
          <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <div className="font-medium text-slate-800">Voice Prompt Result</div>
            <div className="text-sm text-slate-600">Transcript</div>
            <div className="whitespace-pre-wrap text-slate-800">{voiceResult.transcript}</div>
            <div className="text-sm text-slate-600 mt-2">Draft</div>
            <div className="whitespace-pre-wrap text-slate-800">{voiceResult.draft}</div>
            {voiceResult.download_url && voiceResult.filename && (
              <div className="pt-2">
                <button onClick={()=>triggerDownload(voiceResult.filename)} className="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-50">Download</button>
              </div>
            )}
          </section>
        )}

        {result && (
          <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <div className="font-medium text-slate-800">New Draft Result</div>
            <div className="text-sm text-slate-600">Draft</div>
            <div className="whitespace-pre-wrap text-slate-800">{result.draft}</div>
            {result.download_url && result.filename && (
              <div className="pt-2">
                <button onClick={()=>triggerDownload(result.filename)} className="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-50">Download</button>
              </div>
            )}
          </section>
        )}
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
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>}>
        <SearchParamsHandler onParamsLoaded={handleParamsLoaded} />
      </Suspense>
      {paramsLoaded && <NewDraftContent type={params.type} initialDid={params.initialDid} />}
    </>
  );
}


