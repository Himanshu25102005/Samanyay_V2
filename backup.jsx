"use client";
import { useEffect, useRef, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import LanguageSelector from "../../../../components/LanguageSelector.jsx";
import Navbar from "../../../../components/Navbar.jsx";
import { useI18n } from "../../../../components/I18nProvider.jsx";
import useAppLanguage from "../../../../components/useAppLanguage.js";
import { useNavbar } from "../../../../components/NavbarContext.jsx";
import { useUser } from "../../../components/UserContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import StructuredText from "../../../components/StructuredText.jsx";

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
  const { language } = useAppLanguage();
  const { isCollapsed, isLargeScreen } = useNavbar();
  const { userId } = useUser();

  // Per-document type general guidance
  const GUIDANCE_BY_TYPE = {
    "Bail / Anticipatory Bail Application": {
      desc: "Used to request release from custody or prevent arrest.",
      items: [
        "Accused's Information: Full name, address, and occupation.",
        "Case & FIR Details: Provide the FIR number, police station, and the sections of law mentioned (e.g., 420 IPC).",
        "Summary of Allegations: Briefly explain the accusations against the person as per the FIR.",
        "Key Grounds for Bail: State the main reasons for granting bail (e.g., accused is innocent, has strong community ties, will cooperate with the investigation, medical condition).",
        "Prior Criminal Record: Mention if the accused has any past criminal cases. If not, state they have a clean record."
      ]
    },
    "Contract": {
      desc: "A legally binding agreement between parties.",
      items: [
        "Party Details: Full legal names and addresses for all individuals or companies involved.",
        "Core Purpose: What is the main objective of this contract? (e.g., software development, sale of property).",
        "Commercials: Specify the payment amount, payment schedule (e.g., milestones, monthly), and the contract's start and end dates.",
        "Key Obligations: Clearly list the primary responsibilities and deliverables for each party.",
        "Crucial Clauses: Note any specific requirements for Dispute Resolution (Arbitration/Court), Termination, Confidentiality, or Governing Law."
      ]
    },
    "Discharge Application": {
      desc: "Filed to argue there is no evidence to proceed to trial.",
      items: [
        "Case Information: The court name, case number, and FIR number.",
        "Applicant's Name: The person seeking the discharge.",
        "Grounds for Discharge: Explain why the case should be dropped. Focus on key weaknesses (e.g., 'There is no direct evidence linking me to the crime,' 'The complainant's statements are contradictory').",
        "Supporting Evidence: Refer to any specific part of the police report (chargesheet) that supports your claim."
      ]
    },
    "Legal Notice": {
      desc: "A formal warning before taking legal action.",
      items: [
        "Sender & Recipient: Your full name and address, and the full name and address of the party you are sending the notice to.",
        "Background of Dispute: Provide a brief, chronological summary of the events. What happened, where, and when?",
        "Specific Demand (The Relief): Clearly state what you want the other party to do (e.g., 'Pay the outstanding amount of Rs. 1,00,000,' 'Cease using my trademark').",
        "Compliance Deadline: Set a clear timeframe for them to respond (e.g., 'within 15 days of receiving this notice')."
      ]
    },
    "Memorandum of Understanding (MoU)": {
      desc: "A non-binding document outlining a future partnership.",
      items: [
        "Party Details: Names and addresses of all parties intending to collaborate.",
        "Objective of Collaboration: What is the shared goal or project you plan to work on?",
        "Roles & Contributions: Briefly outline the expected responsibilities and contributions of each party.",
        "Key Terms: Mention the proposed duration, confidentiality requirements, and confirm that this MoU will be followed by a formal, binding contract."
      ]
    },
    "Non-Disclosure Agreement (NDA)": {
      desc: "A contract to protect sensitive information.",
      items: [
        "Party Identification: Name the 'Disclosing Party' and the 'Receiving Party'.",
        "Definition of 'Confidential Information': Be specific about what is being protected (e.g., financial data, source code, customer lists).",
        "Purpose of Disclosure: Explain why the information is being shared (e.g., 'to evaluate a potential merger').",
        "Confidentiality Period: State how long the information must be kept secret (e.g., 3 years from today's date)."
      ]
    },
    "Plaint / Complaint": {
      desc: "Initiates a civil action or records a complaint.",
      items: [
        "Plaintiff & Defendant Details: Your full name and address, and the opponent's full name and address.",
        "Detailed Factual Narrative: Provide a step-by-step account of the entire dispute from beginning to end.",
        "Cause of Action: When and where did the main issue occur?",
        "Relief Sought from Court: List exactly what you are asking the court to grant."
      ]
    },
    "Written Statement / Reply / Rejoinder": {
      desc: "Responds to the opponent's claims or documents.",
      items: [
        "Case Identification: Provide the court name, case number, and names of the parties.",
        "Para-wise Response: Respond to each paragraph of the opponent's document (Admit/Deny/Clarify).",
        "Your Version of the Facts: Present your side of the story in a clear, narrative format.",
        "Preliminary Objections: Any initial legal reasons the case is flawed (e.g., lack of jurisdiction, limitation)."
      ]
    },
    "Right to Information (RTI) Application": {
      desc: "Used to formally request information from a public authority.",
      items: [
        "Your Details (Applicant): Full name and complete postal address.",
        "Public Authority Details: Name of the department/office and its address.",
        "Specific Information Required: List exact information needed in a clear, point-by-point format.",
        "Period of Information: Specify the timeframe (e.g., 'For the Financial Year 2023-24').",
        "Below Poverty Line (BPL) Status: State if you belong to BPL to claim fee exemption."
      ]
    },
    "General Purpose Draft": {
      desc: "For any other document like an affidavit, application, or letter.",
      items: [
        "Document Type & Purpose: What is this document and its main goal?",
        "Intended Audience: Who will be reading this?",
        "Key Facts to Include: Essential points, names, dates, and any reference numbers.",
        "Specific Request (Prayer): Clearly state the action you want the reader to take."
      ]
    }
  };

  function resolveGuidance(typeLabel){
    const v = (typeLabel || '').toLowerCase();
    if (v.includes('bail')) return GUIDANCE_BY_TYPE["Bail / Anticipatory Bail Application"];
    if (v.includes('contract')) return GUIDANCE_BY_TYPE["Contract"];
    if (v.includes('discharge')) return GUIDANCE_BY_TYPE["Discharge Application"];
    if (v.includes('legal notice') || v.includes('notice')) return GUIDANCE_BY_TYPE["Legal Notice"];
    if (v.includes('memorandum') || v.includes('mou')) return GUIDANCE_BY_TYPE["Memorandum of Understanding (MoU)"];
    if (v.includes('non-disclosure') || v.includes('nda')) return GUIDANCE_BY_TYPE["Non-Disclosure Agreement (NDA)"];
    if (v.includes('plaint') || v.includes('complaint') || v.includes('petition')) return GUIDANCE_BY_TYPE["Plaint / Complaint"];
    if (v.includes('rejoinder') || v.includes('reply') || v.includes('written statement')) return GUIDANCE_BY_TYPE["Written Statement / Reply / Rejoinder"];
    if (v.includes('rti')) return GUIDANCE_BY_TYPE["Right to Information (RTI) Application"];
    if (v.includes('general')) return GUIDANCE_BY_TYPE["General Purpose Draft"];
    return null;
  }

  const activeGuidance = resolveGuidance(type) || {
    desc: "Include purpose, parties, timelines, terms, and signatures.",
    items: [
      "Be precise, unambiguous, and consistent in definitions.",
      "Add governing law, dispute resolution, and termination clauses.",
      "Consider confidentiality and non-disclosure requirements.",
      "Specify payment terms and conditions clearly.",
      "Include force majeure clauses and ensure legal compliance."
    ]
  };

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
      const res = await fetch(`/Drafting-Assistant/api/drafting/upload?document_type=${encodeURIComponent(type)}&language=${encodeURIComponent(language || 'en')}`, { method: "POST", body: fd });
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
      
      // Build query parameters for voice chat
      const queryParams = new URLSearchParams({
        mode: 'new',
        document_type: type,
        language: language || 'en',
        user_id: userId,
        format: 'docx'
      });
      
      if (documentId) {
        queryParams.append('document_id', documentId);
      }
      
      console.log('Sending voice recording to API with params:', queryParams.toString());
      const res = await fetch(`/Drafting-Assistant/api/drafting/voice-chat?${queryParams.toString()}`, { 
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
        
        // Build query parameters for voice chat
        const queryParams = new URLSearchParams({
          mode: 'new',
          document_type: type,
          language: language || 'en',
          user_id: userId,
          format: 'docx'
        });
        
        if (documentId) {
          queryParams.append('document_id', documentId);
        }
        
        console.log('Generating draft with voice recording...');
        const res = await fetch(`/Drafting-Assistant/api/drafting/voice-chat?${queryParams.toString()}`, { 
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
        const body = JSON.stringify({ prompt, document_id: documentId || null, document_type: type, language: language || 'en' });
        const res = await fetch(`/Drafting-Assistant/api/drafting/new?format=docx`, { 
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
      <div 
        className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 text-slate-900 flex flex-col transition-all duration-300"
        style={{
          paddingLeft: isLargeScreen ? (isCollapsed ? '0px' : '0px') : '0px'
        }}
      >
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="sticky top-0 z-10 backdrop-blur-md bg-white/90 border-b border-slate-200/70 shadow-sm"
        >
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">{t('draftingAssistant')}</h1>
            <LanguageSelector />
          </div>
        </motion.div>
        <main 
          className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
        >

          {/* Two Section Layout */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full items-start">
            {/* Left Section - Document Info & Guidelines (Dynamic Size) */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:w-80 xl:w-96 flex-shrink-0 order-2 lg:order-1 ml-2 lg:ml-0"
            >
              <div className="lg:sticky lg:top-24 space-y-4 ml-2 w-full">
                {/* Document Selection Card */}
                <section className="rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-4 lg:p-6 shadow-sm hover:shadow-md mt-2 transition-all duration-300">
                  <div className="font-semibold text-slate-800 mb-3 text-base lg:text-lg flex items-center gap-3">
                    <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <svg className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="hidden sm:inline">Selected Document</span>
                    <span className="sm:hidden">Document</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-slate-500 font-medium">{t('selectedType')}</div>
                    <div className="text-sm lg:text-base font-semibold text-slate-800 bg-slate-50 rounded-lg p-3 border border-slate-200">
                      {type}
                    </div>
                    {documentId && (
                      <div className="text-xs text-slate-600 bg-blue-50 rounded-lg p-2 border border-blue-200">
                        <span className="font-medium">Document ID:</span> 
                        <span className="font-mono ml-1">{documentId.substring(0, 8)}...</span>
                      </div>
                    )}
                  </div>
                </section>

                {/* Guidelines Card */}
                <section className="rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-4 lg:p-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="font-semibold text-slate-800 mb-3 text-base lg:text-lg flex items-center gap-3">
                    <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-lg bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                      <svg className="w-3 h-3 lg:w-4 lg:h-4 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="hidden sm:inline">General Guidance</span>
                    <span className="sm:hidden">Guidelines</span>
                  </div>
                  {activeGuidance.desc && (
                    <div className="text-slate-700 text-xs lg:text-sm mb-3 leading-relaxed">
                      {activeGuidance.desc}
                    </div>
                  )}
                  <ul className="space-y-2 lg:space-y-3 text-slate-600 text-xs lg:text-sm leading-relaxed">
                    {activeGuidance.items.map((item, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                        className="flex items-start gap-2 lg:gap-3"
                      >
                        <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-sky-400 mt-1.5 lg:mt-2 flex-shrink-0"></div>
                        <span className="text-xs lg:text-sm">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </section>
              </div>
            </motion.div>

            {/* Right Section - Chat Interface (Full Width) */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex-1 min-w-0 order-1 lg:order-2 mr-2 lg:mr-0 w-full"
              ref={chatSectionRef}
            >
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
                          <div className="font-semibold text-base mb-1">Ready to Draft! 🚀</div>
                          <div className="text-sm text-sky-100">Start creating your document below</div>
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

              <section className="rounded-xl border border-slate-200/60 bg-white/90 backdrop-blur-sm flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 h-[calc(100vh-120px)] lg:h-[calc(100vh-100px)] mt-2 mr-2 lg:mr-4">
                {/* Chat Header */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="p-4 sm:p-5 lg:p-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-white/50 flex-shrink-0"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 text-base sm:text-lg lg:text-xl">Draft Generation Chat</div>
                      <div className="text-xs sm:text-sm text-slate-500 truncate">Get help with your document drafting</div>
                    </div>
                  </div>
                </motion.div>

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
                            <div className="text-sm text-green-800 max-h-[400px] sm:max-h-[500px] overflow-y-auto break-words">
                              <StructuredText text={voiceResult.draft} />
                            </div>
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
                          <div className="text-sm text-green-800 max-h-[400px] sm:max-h-[500px] overflow-y-auto break-words">
                            <StructuredText text={result.draft} />
                          </div>
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
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="p-3 sm:p-4 lg:p-5 border-t border-slate-200/60 bg-gradient-to-r from-slate-50/80 to-white/80 backdrop-blur-sm flex-shrink-0"
                >
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-xs sm:text-sm mb-3"
                    >
                      {String(error)}
                    </motion.div>
                  )}
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Instructions</label>
                      <textarea 
                        value={prompt} 
                        onChange={(e)=>setPrompt(e.target.value)} 
                        rows={3} 
                        className="w-full rounded-xl border border-slate-300/60 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400 text-xs sm:text-sm resize-none transition-all duration-200 placeholder:text-slate-400" 
                        placeholder="Describe the draft you want..." 
                      />
                    </div>
                    
                    {/* All Buttons - Responsive Layout */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      {/* Upload Document Button */}
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }} 
                        onClick={onChooseFile} 
                        className="rounded-lg sm:rounded-xl bg-slate-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-slate-700 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="hidden sm:inline">Upload</span>
                        <span className="sm:hidden">📄</span>
                      </motion.button>
                      
                      {/* Voice Recording Button */}
                      {!recording ? (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }} 
                          onClick={startRecording} 
                          className="rounded-lg sm:rounded-xl border border-slate-300/60 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-slate-50/80 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                          </svg>
                          <span className="hidden sm:inline">Record</span>
                          <span className="sm:hidden">🎤</span>
                        </motion.button>
                      ) : (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }} 
                          onClick={stopRecording} 
                          className="rounded-lg sm:rounded-xl bg-red-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-red-700 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-sm"></div>
                          <span className="text-xs sm:text-sm">Stop ({recordingDuration}s)</span>
                        </motion.button>
                      )}
                      
                      {/* Process Voice Button */}
                      {audioBlob && !recording && (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }} 
                          onClick={processVoiceRecording}
                          disabled={isProcessingVoice}
                          className="rounded-lg sm:rounded-xl bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-green-700 disabled:opacity-50 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          {isProcessingVoice ? (
                            <>
                              <div className="w-2 h-2 sm:w-3 sm:h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span className="hidden sm:inline">Processing...</span>
                              <span className="sm:hidden">⏳</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
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
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }} 
                        disabled={submitting || (!prompt.trim() && !audioBlob)} 
                        onClick={generateNewDraft} 
                        className="rounded-lg sm:rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 hover:from-sky-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex-1 sm:flex-initial justify-center"
                      >
                        {submitting ? (
                          <>
                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs sm:text-sm">Generating...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs sm:text-sm">Generate Draft</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                    
                    {/* Status Indicators */}
                    <div className="flex items-center gap-2 sm:gap-3 text-xs flex-wrap">
                      {uploading && (
                        <span className="text-slate-600 flex items-center gap-1">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs">Uploading…</span>
                        </span>
                      )}
                      {documentId && (
                        <span className="text-slate-700 truncate max-w-[150px] sm:max-w-none text-xs">
                          Doc ID: <span className="font-mono">{documentId.substring(0, 6)}...</span>
                        </span>
                      )}
                      {recording && (
                        <div className="flex items-center gap-1 sm:gap-2 text-red-600 font-medium">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-600 rounded-full animate-pulse"></div>
                          <span className="text-xs">Recording... ({recordingDuration}s)</span>
                        </div>
                      )}
                      {audioBlob && !recording && (
                        <div className="flex items-center gap-1 sm:gap-2 text-green-600 font-medium">
                          <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs">Ready ({Math.round(audioBlob.size / 1024)}KB)</span>
                        </div>
                      )}
                      {submitting && (
                        <span className="text-slate-600 flex items-center gap-1">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs">Creating your draft...</span>
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </section>
            </motion.div>
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