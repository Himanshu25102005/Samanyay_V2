"use client";
import { useState, Suspense, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import LanguageSelector from "../../../../components/LanguageSelector.jsx";
import Navbar from "../../../../components/Navbar.jsx";
import { useI18n } from "../../../../components/I18nProvider.jsx";
import useAppLanguage from "../../../../components/useAppLanguage.js";
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

function ImproveDraftContent({ type, initialDid }) {
  const { t } = useI18n();
  const { language } = useAppLanguage();
  // Per-document type general guidance (same mapping as New Draft)
  const GUIDANCE_BY_TYPE = {
    "Bail / Anticipatory Bail Application": {
      desc: "Used to request release from custody or prevent arrest.",
      items: [
        "Accused's Information: Full name, address, and occupation.",
        "Case & FIR Details: Provide the FIR number, police station, and the sections of law mentioned (e.g., 420 IPC).",
        "Summary of Allegations: Briefly explain the accusations against the person as per the FIR.",
        "Key Grounds for Bail: Reasons for granting bail (innocence, cooperation, medical condition, community ties).",
        "Prior Criminal Record: Mention any past cases or state clean record."
      ]
    },
    "Contract": {
      desc: "A legally binding agreement between parties.",
      items: [
        "Party Details: Full legal names and addresses.",
        "Core Purpose: Objective of the contract (e.g., software development, sale of property).",
        "Commercials: Payment amount, schedule, start and end dates.",
        "Key Obligations: Responsibilities and deliverables for each party.",
        "Crucial Clauses: Dispute Resolution, Termination, Confidentiality, Governing Law."
      ]
    },
    "Discharge Application": {
      desc: "Filed to argue there is no evidence to proceed to trial.",
      items: [
        "Case Information: Court name, case number, FIR number.",
        "Applicant's Name: Person seeking discharge.",
        "Grounds for Discharge: Key weaknesses (no direct evidence, contradictions).",
        "Supporting Evidence: Cite specific parts of the chargesheet supporting discharge."
      ]
    },
    "Legal Notice": {
      desc: "A formal warning before taking legal action.",
      items: [
        "Sender & Recipient: Full names and addresses.",
        "Background of Dispute: Brief chronological summary (what, where, when).",
        "Specific Demand (Relief): Exact action required (e.g., pay dues, cease trademark use).",
        "Compliance Deadline: Set clear timeframe (e.g., within 15 days)."
      ]
    },
    "Memorandum of Understanding (MoU)": {
      desc: "A non-binding document outlining a future partnership.",
      items: [
        "Party Details: Names and addresses.",
        "Objective of Collaboration: Shared goal or project.",
        "Roles & Contributions: Expected responsibilities of each party.",
        "Key Terms: Duration, confidentiality, intent to execute a binding contract later."
      ]
    },
    "Non-Disclosure Agreement (NDA)": {
      desc: "A contract to protect sensitive information.",
      items: [
        "Parties: Disclosing Party and Receiving Party.",
        "Confidential Information: Define clearly (e.g., financials, source code, customer lists).",
        "Purpose of Disclosure: Reason for sharing (e.g., evaluate merger).",
        "Confidentiality Period: Duration (e.g., 3 years from today's date)."
      ]
    },
    "Plaint / Complaint": {
      desc: "Initiates a civil action or records a complaint.",
      items: [
        "Plaintiff & Defendant Details: Names and addresses.",
        "Detailed Factual Narrative: Step-by-step account of the dispute.",
        "Cause of Action: When and where the main issue occurred.",
        "Relief Sought: Precise remedies requested from court."
      ]
    },
    "Written Statement / Reply / Rejoinder": {
      desc: "Responds to the opponent's claims or documents.",
      items: [
        "Case Identification: Court, case number, party names.",
        "Para-wise Response: Admit/Deny/Clarify each paragraph.",
        "Your Version of the Facts: Clear narrative of your stance.",
        "Preliminary Objections: Legal flaws (jurisdiction, limitation, etc.)."
      ]
    },
    "Right to Information (RTI) Application": {
      desc: "Used to formally request information from a public authority.",
      items: [
        "Applicant Details: Full name and postal address.",
        "Public Authority Details: Department/office name and address.",
        "Specific Information Required: Point-wise list of exact info sought.",
        "Period of Information: Define timeframe (e.g., FY 2023-24).",
        "BPL Status: Declare if BPL to claim fee exemption."
      ]
    },
    "General Purpose Draft": {
      desc: "For affidavits, applications, formal letters, etc.",
      items: [
        "Document Type & Purpose: Define and state the goal.",
        "Intended Audience: Judge, govt body, opposing lawyer, etc.",
        "Key Facts to Include: Names, dates, reference numbers.",
        "Specific Request (Prayer): Action you want the reader to take."
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
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'uploading', 'success', 'error'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [userId] = useState('default_user');

  async function uploadSupportingDoc(file) {
    setUploading(true);
    setUploadStatus('uploading');
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      
      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      const res = await fetch(`/Drafting-Assistant/api/drafting/upload?user_id=${encodeURIComponent(userId)}&document_type=${encodeURIComponent(type)}&language=${encodeURIComponent(language || 'en')}`, { 
        method: "POST", 
        body: fd 
      });
      
      console.log('Upload response status:', res.status, res.statusText);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Upload error response:', errorText);
        throw new Error(`Upload failed: ${res.status} ${res.statusText}. ${errorText}`);
      }
      
      const text = await res.text();
      console.log('Upload response text:', text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error('Failed to parse response as JSON:', parseErr);
        throw new Error(`Invalid response format: ${text.substring(0, 100)}...`);
      }
      
      if (data?.data?.document_id) {
        setDocumentId(data.data.document_id);
        setUploadStatus('success');
        console.log('Upload successful, document ID:', data.data.document_id);
      } else {
        console.error('No document ID in response:', data);
        throw new Error('No document ID received from server. Response: ' + JSON.stringify(data));
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      setUploadStatus('error');
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

  async function generateImprovedDraft() {
    if (!documentId) {
      setError('Please upload a document first');
      return;
    }
    if (!prompt.trim()) {
      setError('Please enter your instructions');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    try {
      const body = JSON.stringify({ prompt, document_id: documentId, document_type: type, user_id: userId, language: language || 'en' });
      const res = await fetch(`/Drafting-Assistant/api/drafting/improve?format=docx`, { 
        method: "POST", 
        headers: { "content-type": "application/json" }, 
        body 
      });
      
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      }
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { status: 'error', message: text };
      }
      
      if (data.status === 'error') {
        throw new Error(data.message || 'Unknown error occurred');
      }
      
      setResult(data?.data || null);
    } catch (err) {
      console.error('Generate draft error:', err);
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

  async function checkBackendHealth() {
    try {
      const res = await fetch('/Drafting-Assistant/api/drafting/health');
      const data = await res.json();
      setBackendStatus(data);
      console.log('Backend health check:', data);
    } catch (err) {
      console.error('Health check failed:', err);
      setBackendStatus({ status: 'error', message: err.message });
    }
  }

  function toggleVoiceRecording(){
    // Placeholder: actual audio capture will be integrated with microservices later
    setIsRecording((prev)=>!prev);
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 flex flex-col">
        <div className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-slate-200">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-sky-800">{t('draftingAssistant')}</h1>
            <div className="flex items-center gap-3">
              {/* <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={checkBackendHealth}
                className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 border"
              >
                Check Backend
              </motion.button> */}
              <LanguageSelector />
            </div>
          </div>
        </div>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="mb-4 ml-6 mt-2">
            <div className="text-sm text-slate-600">{t('selectedType')}</div>
            <div className="text-lg font-medium text-slate-800">{type}</div>
          </div>

          {/* Backend Status Display
          {backendStatus && (
            <div className="mb-4">
              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="font-medium text-slate-800 mb-2">Backend Service Status</div>
                <div className={`p-3 rounded-lg ${
                  backendStatus.status === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className={`w-4 h-4 ${backendStatus.status === 'success' ? 'text-green-600' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      {backendStatus.status === 'success' ? (
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      )}
                    </svg>
                    <span className="font-medium">
                      {backendStatus.status === 'success' ? 'Backend Service Online' : 'Backend Service Offline'}
                    </span>
                  </div>
                  <div className="text-xs mt-1">
                    {backendStatus.status === 'success' ? (
                      <div>
                        <div>Status: {backendStatus.backend_status}</div>
                        <div>Response: {backendStatus.backend_response}</div>
                      </div>
                    ) : (
                      <div>
                        <div>Error: {backendStatus.message}</div>
                        <div>URL: {backendStatus.backend_url}</div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )} */}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left Side - General Guidance */}
            <div className="lg:col-span-3 ml-5 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24">
                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="font-semibold text-slate-800 mb-3 text-base flex items-center gap-2">
                    <svg className="w-5 h-5 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    General Guidance
                  </div>
                {activeGuidance.desc && (
                  <div className="text-slate-700 text-sm mb-2">
                    {activeGuidance.desc}
                  </div>
                )}
                <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm leading-relaxed">
                  {activeGuidance.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                </section>
              </div>
            </div>

          {/* Right Side - Chat Interface */}
            <div className="lg:col-span-9 order-1 lg:order-2">
              <section className="rounded-xl border mt-6 mr-7 border-slate-200 bg-white flex flex-col shadow-sm" style={{ height: 'calc(100vh - 150px)', minHeight: '500px' }}>
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
                      <div className="font-semibold text-slate-800 text-base sm:text-lg">Draft Improvement Chat</div>
                      <div className="text-xs sm:text-sm text-slate-600 truncate">Get help improving your document</div>
                    </div>
                  </div>
                </div>

                {/* Chat Messages Area - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0">
                  <AnimatePresence>
                    {result && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="bg-blue-50 rounded-lg p-3">
                              <div className="text-sm font-medium text-blue-900 mb-2">Improvements Analysis</div>
                              <div className="text-sm text-blue-800 whitespace-pre-wrap max-h-[500px] overflow-y-auto break-words">{result.improvements_analysis}</div>
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
                              <div className="text-sm font-medium text-green-900 mb-2">Improved Draft</div>
                              <div className="text-sm text-green-800 whitespace-pre-wrap max-h-[500px] sm:max-h-[500px] overflow-y-auto break-words">{result.updated_draft}</div>
                              {result.download_url && result.filename && (
                                <div className="mt-3">
                                  <motion.button 
                                    whileTap={{ scale: 0.95 }}
                                    onClick={()=>triggerDownload(result.filename)} 
                                    className="text-xs sm:text-sm bg-[#0818A8] text-white px-4 py-2 rounded-lg hover:bg-[#0A1BB8] transition-colors"
                                  >
                                    Download Improved Draft
                                  </motion.button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!result && (
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
                        <p className="text-base sm:text-lg font-medium text-slate-600 mb-2">Ready to Improve</p>
                        <p className="text-sm text-slate-500">Upload a document and add instructions to see results here</p>
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
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Improvement Instructions</label>
                      <textarea 
                        value={prompt} 
                        onChange={(e)=>setPrompt(e.target.value)} 
                        rows={2} 
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm resize-none" 
                        placeholder="Describe improvements you want..." 
                      />
                    </div>

                    {/* All Buttons - Responsive Layout */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Upload Document Button */}
                      <motion.button 
                        whileTap={{ scale: 0.95 }} 
                        onClick={onChooseFile} 
                        disabled={uploading}
                        className="rounded-lg bg-[#0818A8] text-white px-3 py-2 hover:bg-[#0A1BB8] disabled:opacity-50 flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="hidden sm:inline">Upload</span>
                        <span className="sm:hidden">📄</span>
                      </motion.button>

                      {/* Voice Input Button (placeholder) */}
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={toggleVoiceRecording}
                        aria-pressed={isRecording}
                        aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
                        className={`rounded-lg border px-3 py-2 text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 ${isRecording ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'}`}
                      >
                        <svg className={`w-4 h-4 ${isRecording ? 'text-rose-600' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a3 3 0 003-3V5a3 3 0 10-6 0v4a3 3 0 003 3z" />
                          <path fillRule="evenodd" d="M5 9a1 1 0 112 0 3 3 0 006 0 1 1 0 112 0 5 5 0 01-4 4.9V16h2a1 1 0 110 2H9a1 1 0 110-2h2v-2.1A5 5 0 015 9z" clipRule="evenodd" />
                        </svg>
                      </motion.button>

                      {/* Generate Improved Draft Button */}
                      <motion.button 
                        whileTap={{ scale: 0.95 }} 
                        disabled={!documentId || submitting || !prompt.trim()} 
                        onClick={generateImprovedDraft} 
                        className="rounded-lg bg-[#0818A8] text-white px-4 py-2 hover:bg-[#0A1BB8] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Improving...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            <span>Improve Draft</span>
                          </>
                        )}
                      </motion.button>
                    </div>

                    {/* Status Indicators */}
                    <div className="flex items-center gap-3 sm:gap-4 text-xs flex-wrap">
                      {isRecording && (
                        <span className="text-rose-700 flex items-center gap-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                          Recording…
                        </span>
                      )}
                      {uploading && (
                        <span className="text-slate-600 flex items-center gap-1">
                          <div className="w-3 h-3 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                          Uploading…
                        </span>
                      )}
                      {uploadStatus === 'success' && (
                        <span className="text-green-600">Upload successful!</span>
                      )}
                      {uploadStatus === 'error' && (
                        <span className="text-red-600">Upload failed</span>
                      )}
                      {documentId && (
                        <span className="text-slate-700 truncate max-w-[200px] sm:max-w-none">
                          document_id: <span className="font-mono text-xs">{documentId}</span>
                        </span>
                      )}
                      {submitting && (
                        <span className="text-slate-600 flex items-center gap-1">
                          <div className="w-3 h-3 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                          Improving your draft...
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

export default function ImproveDraftPage() {
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
      {paramsLoaded && <ImproveDraftContent type={params.type} initialDid={params.initialDid} />}
    </>
  );
}
