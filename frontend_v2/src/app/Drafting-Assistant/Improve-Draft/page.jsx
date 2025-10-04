"use client";
import { useState, Suspense, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import LanguageSelector from "../../../../components/LanguageSelector.jsx";
import Navbar from "../../../../components/Navbar.jsx";
import { useI18n } from "../../../../components/I18nProvider.jsx";

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

  const [documentId, setDocumentId] = useState(initialDid || null);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'uploading', 'success', 'error'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);

  async function uploadSupportingDoc(file) {
    setUploading(true);
    setUploadStatus('uploading');
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      
      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      const res = await fetch("/Drafting-Assistant/api/drafting/upload", { 
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
      const body = JSON.stringify({ prompt, document_id: documentId });
      const res = await fetch("/Drafting-Assistant/api/drafting/improve?format=docx", { 
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

  return (
    <>
      <Navbar />
      <div className="ml-[280px] min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <div className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-1 py-3 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold text-sky-800">{t('draftingAssistant')}</h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={checkBackendHealth}
              className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 border"
            >
              Check Backend
            </button>
            <LanguageSelector />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-1 py-4">
        <div className="mb-4">
          <div className="text-sm text-slate-600">{t('selectedType')}</div>
          <div className="text-lg font-medium text-slate-800">{type}</div>
        </div>

        {/* Backend Status Display */}
        {backendStatus && (
          <div className="mb-4">
            <section className="rounded-xl border border-slate-200 bg-white p-4">
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
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 h-[calc(100vh-180px)]">
          {/* Left Side - General Guidance */}
          <div className="lg:col-span-1">
            <section className="rounded-xl border border-slate-200 bg-white p-3 h-fit max-h-[calc(100vh-280px)]">
              <div className="font-medium text-slate-800 mb-2 text-sm">General Guidance</div>
              <ul className="list-disc pl-4 space-y-1 text-slate-700 text-xs">
                <li>Include purpose, involved parties, timelines, terms, signatures.</li>
                <li>Be precise, unambiguous, and consistent in definitions.</li>
                <li>Add governing law, dispute resolution, and termination clauses.</li>
                <li>Consider confidentiality and non-disclosure requirements.</li>
                <li>Specify payment terms and conditions clearly.</li>
                <li>Include force majeure and termination clauses.</li>
                <li>Define dispute resolution mechanisms.</li>
                <li>Ensure compliance with applicable laws.</li>
              </ul>
            </section>
          </div>

          {/* Right Side - Chat Interface */}
          <div className="lg:col-span-5">
            <section className="rounded-xl border border-slate-200 bg-white flex flex-col h-full">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200">
                <div className="font-medium text-slate-800">Draft Improvement Chat</div>
                <div className="text-sm text-slate-600">Get help improving your document</div>
              </div>

              {/* Chat Messages Area - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {result && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-blue-900 mb-2">Improvements Analysis</div>
                          <div className="text-sm text-blue-800 whitespace-pre-wrap max-h-[500px] overflow-y-auto">{result.improvements_analysis}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-green-900 mb-2">Improved Draft</div>
                          <div className="text-sm text-green-800 whitespace-pre-wrap max-h-[500px] overflow-y-auto">{result.updated_draft}</div>
                          {result.download_url && result.filename && (
                            <div className="mt-3">
                              <button 
                                onClick={()=>triggerDownload(result.filename)} 
                                className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                              >
                                Download Improved Draft
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!result && (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p>Upload a document and provide improvement instructions to see results here</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Area - Fixed at bottom */}
              <div className="p-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
                {error && <div className="rounded-md border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm mb-3">{String(error)}</div>}
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Improvement Instructions</label>
                    <textarea 
                      value={prompt} 
                      onChange={(e)=>setPrompt(e.target.value)} 
                      rows={2} 
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm" 
                      placeholder="Describe improvements you want..." 
                    />
                  </div>
                  
                  {/* All Buttons in One Line */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Upload Document Button */}
                    <button 
                      onClick={onChooseFile} 
                      disabled={uploading}
                      className="rounded-lg bg-slate-600 text-white px-3 py-1.5 hover:bg-slate-700 disabled:opacity-50 flex items-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                    
                    {/* Generate Improved Draft Button */}
                    <button 
                      disabled={!documentId || submitting || !prompt.trim()} 
                      onClick={generateImprovedDraft} 
                      className="rounded-lg bg-sky-600 text-white px-4 py-1.5 hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2 text-sm"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Improving...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                          </svg>
                          Improve Draft
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Status Indicators */}
                  <div className="flex items-center gap-4 text-xs">
                    {uploading && <span className="text-slate-600">Uploading…</span>}
                    {uploadStatus === 'success' && <span className="text-green-600">Upload successful!</span>}
                    {uploadStatus === 'error' && <span className="text-red-600">Upload failed</span>}
                    {documentId && <span className="text-slate-700">document_id: <span className="font-mono">{documentId}</span></span>}
                    {submitting && <span className="text-slate-600">Improving your draft...</span>}
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


