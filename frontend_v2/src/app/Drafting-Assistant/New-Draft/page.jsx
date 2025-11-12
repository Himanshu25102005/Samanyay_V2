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
  
  // Mobile UI state management
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const chatSectionRef = useRef(null);
  const inputRef = useRef(null);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.durationInterval) {
        clearInterval(mediaRecorderRef.current.durationInterval);
      }
    };
  }, []);

  // Enhanced mobile scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 1024 && showScrollHint) {
        setShowScrollHint(false);
      }
    };
    
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowScrollHint(false);
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [showScrollHint]);

  // Smooth scroll to chat with enhanced animation
  const scrollToChat = () => {
    setShowScrollHint(false);
    if (chatSectionRef.current) {
      chatSectionRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  // Focus input after generation
  const focusInput = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  async function uploadSupportingDoc(file) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/Drafting-Assistant/api/drafting/upload?document_type=${encodeURIComponent(type)}&language=${encodeURIComponent(language || 'en')}`, { method: "POST", body: fd });
      
      // Check content type before parsing JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Expected JSON but received:', contentType);
        throw new Error('Response is not JSON');
      }
      
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
    try {
      const res = await fetch(`/Drafting-Assistant/api/drafting/download/${encodeURIComponent(filename)}`);
      
      // Check content type before parsing JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Expected JSON but received:', contentType);
        throw new Error('Response is not JSON');
      }
      
      const data = await res.json();
      alert("File downloaded");
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download file');
    }
  }

  return (
    <>
      <Navbar />
        <div 
          className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 text-slate-900 flex flex-col transition-all duration-500 ease-out"
          style={{
            paddingLeft: isLargeScreen ? (isCollapsed ? '0px' : '0px') : '0px'
          }}
        >
        {/* Enhanced Header with Mobile Menu */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="sticky top-0 z-20 backdrop-blur-xl bg-white/95 border-b border-slate-200/70 shadow-sm"
        >
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-3 lg:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 tracking-tight">{t('draftingAssistant')}</h1>
              </div>
              <div className="flex items-center gap-2">
                <LanguageSelector />
                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute right-0 top-0 h-full w-72 sm:w-80 max-w-[90vw] bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg font-semibold text-slate-800">Document Info</h2>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Mobile Document Info */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                      <div className="text-sm font-medium text-slate-600 mb-2">Document Type</div>
                      <div className="text-base font-semibold text-slate-800">{type}</div>
                      {documentId && (
                        <div className="mt-2 text-xs text-slate-500">
                          ID: {documentId.substring(0, 8)}...
                        </div>
                      )}
                    </div>
                    
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                      <div className="text-sm font-medium text-slate-600 mb-3">Guidelines</div>
                      {activeGuidance.desc && (
                        <div className="text-sm text-slate-700 mb-3 leading-relaxed">
                          {activeGuidance.desc}
                        </div>
                      )}
                      <ul className="space-y-2 text-sm text-slate-600">
                        {activeGuidance.items.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2 flex-shrink-0"></div>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <main 
          className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4 lg:py-6"
        >
          {/* Responsive Layout */}
          <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 lg:gap-6 h-full items-start">
            {/* Left Section - Document Info & Guidelines (Hidden on Mobile) */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0"
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

            {/* Right Section - Chat Interface (Full Width on Mobile) */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex-1 min-w-0 w-full lg:w-auto"
              ref={chatSectionRef}
            >
              {/* Enhanced Mobile Scroll Hint */}
              <AnimatePresence>
                {showScrollHint && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="lg:hidden mb-2 sm:mb-3 relative"
                  >
                    <motion.div 
                      onClick={scrollToChat}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white rounded-2xl p-3 sm:p-4 lg:p-5 shadow-xl cursor-pointer relative overflow-hidden"
                    >
                      {/* Animated background */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                      
                      <div className="relative flex items-center justify-between">
                        <div className="flex-1">
                          <motion.div 
                            className="font-bold text-base sm:text-lg mb-1"
                            animate={{ opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            Ready to Draft! 🚀
                          </motion.div>
                          <div className="text-xs sm:text-sm text-sky-100/90">Start creating your document below</div>
                        </div>
                        <motion.div
                          animate={{ 
                            y: [0, -8, 0],
                            rotate: [0, 5, 0]
                          }}
                          transition={{ 
                            duration: 1.8, 
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                          className="ml-3"
                        >
                          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <section className="rounded-2xl border border-slate-200/60 bg-white/95 backdrop-blur-sm flex flex-col shadow-xl hover:shadow-2xl transition-all duration-500 ease-out h-[calc(100vh-90px)] sm:h-[calc(100vh-80px)] lg:h-[calc(100vh-60px)]">
                {/* Enhanced Chat Header */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="p-3 sm:p-4 lg:p-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/80 to-white/80 flex-shrink-0"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <motion.div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ type: 'spring', damping: 15 }}
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                      </svg>
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 text-base sm:text-lg lg:text-xl">Draft Generation Chat</div>
                      <div className="text-xs sm:text-sm text-slate-500 truncate">Get help with your document drafting</div>
                    </div>
                    {/* Mobile Info Button */}
                    <button
                      onClick={() => setIsMobileMenuOpen(true)}
                      className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 flex items-center gap-2"
                      aria-label="General Guidance"
                    >
                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-medium text-sky-700 block sm:hidden">General Guidance</span>
                    </button>
                  </div>
                </motion.div>

                {/* Enhanced Chat Messages Area - Smooth Scrolling */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4 min-h-0 scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
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
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="flex items-center justify-center h-full text-slate-500"
                    >
                      <div className="text-center px-4">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.05, 1],
                            rotate: [0, 2, 0]
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                          className="relative"
                        >
                          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center shadow-lg">
                            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          {/* Floating dots */}
                          <motion.div
                            className="absolute -top-2 -right-2 w-3 h-3 bg-sky-400 rounded-full"
                            animate={{ 
                              y: [0, -10, 0],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity,
                              delay: 0.5
                            }}
                          />
                          <motion.div
                            className="absolute -bottom-2 -left-2 w-2 h-2 bg-blue-400 rounded-full"
                            animate={{ 
                              y: [0, 10, 0],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{ 
                              duration: 2.5, 
                              repeat: Infinity,
                              delay: 1
                            }}
                          />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.6 }}
                        >
                          <p className="text-lg sm:text-xl font-semibold text-slate-700 mb-2">Ready to Start</p>
                          <p className="text-sm sm:text-base text-slate-500">Begin generating your draft to see results here</p>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Enhanced Chat Input Area */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="p-2 sm:p-3 lg:p-5 border-t border-slate-200/60 bg-gradient-to-r from-slate-50/90 to-white/90 backdrop-blur-sm flex-shrink-0"
                >
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-xs sm:text-sm mb-3"
                    >
                      {String(error)}
                    </motion.div>
                  )}
                  <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 sm:mb-2">Instructions</label>
                      <textarea 
                        ref={inputRef}
                        value={prompt} 
                        onChange={(e)=>{
                          setPrompt(e.target.value);
                          // Auto-resize textarea
                          e.target.style.height = 'auto';
                          e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                        }} 
                        rows={1} 
                        style={{ minHeight: '40px', maxHeight: '200px' }}
                        className="w-full rounded-xl border border-slate-300/60 bg-white/90 backdrop-blur-sm px-2 sm:px-3 lg:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400 text-xs sm:text-sm resize-none transition-all duration-300 placeholder:text-slate-400 shadow-sm hover:shadow-md overflow-y-auto" 
                        placeholder="Describe the draft you want..." 
                      />
                    </div>
                    
                    {/* Enhanced Button Layout */}
                    <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-wrap">
                      {/* Upload Document Button */}
                      <motion.button 
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }} 
                        onClick={onChooseFile} 
                        className="rounded-xl bg-slate-600 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 hover:bg-slate-700 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
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
                          whileHover={{ scale: 1.05, y: -1 }}
                          whileTap={{ scale: 0.95 }} 
                          onClick={startRecording} 
                          className="rounded-xl border border-slate-300/60 bg-white/90 backdrop-blur-sm px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 hover:bg-slate-50/90 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                          </svg>
                          <span className="hidden sm:inline">Record</span>
                          <span className="sm:hidden">🎤</span>
                        </motion.button>
                      ) : (
                        <motion.button 
                          whileHover={{ scale: 1.05, y: -1 }}
                          whileTap={{ scale: 0.95 }} 
                          onClick={stopRecording} 
                          className="rounded-xl bg-red-600 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 hover:bg-red-700 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          <motion.div 
                            className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-sm"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          />
                          <span className="text-xs sm:text-sm">Stop ({recordingDuration}s)</span>
                        </motion.button>
                      )}
                      
                      {/* Process Voice Button */}
                      {audioBlob && !recording && (
                        <motion.button 
                          whileHover={{ scale: 1.05, y: -1 }}
                          whileTap={{ scale: 0.95 }} 
                          onClick={processVoiceRecording}
                          disabled={isProcessingVoice}
                          className="rounded-xl bg-green-600 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 hover:bg-green-700 disabled:opacity-50 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          {isProcessingVoice ? (
                            <>
                              <motion.div 
                                className="w-2 h-2 sm:w-3 sm:h-3 border-2 border-white border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              />
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
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }} 
                        disabled={submitting || (!prompt.trim() && !audioBlob)} 
                        onClick={() => {
                          generateNewDraft();
                          focusInput();
                        }} 
                        className="rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 hover:from-sky-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex-1 sm:flex-initial justify-center"
                      >
                        {submitting ? (
                          <>
                            <motion.div 
                              className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
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
                    
                    {/* Enhanced Status Indicators */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.8 }}
                      className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 text-xs flex-wrap"
                    >
                      {uploading && (
                        <motion.span 
                          className="text-slate-600 flex items-center gap-1"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <motion.div 
                            className="w-2 h-2 sm:w-3 sm:h-3 border-2 border-slate-600 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          <span className="text-xs">Uploading…</span>
                        </motion.span>
                      )}
                      {documentId && (
                        <motion.span 
                          className="text-slate-700 truncate max-w-[150px] sm:max-w-none text-xs"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          Doc ID: <span className="font-mono text-blue-600">{documentId.substring(0, 6)}...</span>
                        </motion.span>
                      )}
                      {recording && (
                        <motion.div 
                          className="flex items-center gap-1 sm:gap-2 text-red-600 font-medium"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <motion.div 
                            className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-600 rounded-full"
                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          />
                          <span className="text-xs">Recording... ({recordingDuration}s)</span>
                        </motion.div>
                      )}
                      {audioBlob && !recording && (
                        <motion.div 
                          className="flex items-center gap-1 sm:gap-2 text-green-600 font-medium"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <motion.svg 
                            className="w-2 h-2 sm:w-3 sm:h-3" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </motion.svg>
                          <span className="text-xs">Ready ({Math.round(audioBlob.size / 1024)}KB)</span>
                        </motion.div>
                      )}
                      {submitting && (
                        <motion.span 
                          className="text-slate-600 flex items-center gap-1"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <motion.div 
                            className="w-2 h-2 sm:w-3 sm:h-3 border-2 border-slate-600 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          <span className="text-xs">Creating your draft...</span>
                        </motion.span>
                      )}
                    </motion.div>
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
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 flex items-center justify-center"
        >
          <div className="text-center">
            <motion.div 
              className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full mx-auto mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div 
              className="text-slate-700 font-semibold text-lg"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Loading...
            </motion.div>
          </div>
        </motion.div>
      }>
        <SearchParamsHandler onParamsLoaded={handleParamsLoaded} />
      </Suspense>
      {paramsLoaded && <NewDraftContent type={params.type} initialDid={params.initialDid} />}
    </>
  );
}