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
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
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

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <div>
          <div className="text-sm text-slate-600">{t('selectedType')}</div>
          <div className="text-lg font-medium text-slate-800">{type}</div>
        </div>

        {/* Backend Status Display */}
        {backendStatus && (
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
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="font-medium text-slate-800 mb-2">General Guidance</div>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li>Include purpose, involved parties, timelines, terms, signatures.</li>
            <li>Be precise, unambiguous, and consistent in definitions.</li>
            <li>Add governing law, dispute resolution, and termination clauses.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={onChooseFile} 
              disabled={uploading}
              className="rounded-lg bg-sky-600 text-white px-4 py-2 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : t('uploadSupportingDocument')}
            </button>
            
            {/* Upload Status Display */}
            {uploadStatus === 'uploading' && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading document...</span>
              </div>
            )}
            
            {uploadStatus === 'success' && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Upload successful!</span>
              </div>
            )}
            
            {uploadStatus === 'error' && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Upload failed</span>
              </div>
            )}
            
            {documentId && (
              <span className="text-sm text-slate-700">
                Document ID: <span className="font-mono bg-slate-100 px-2 py-1 rounded">{documentId}</span>
              </span>
            )}
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-red-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm text-slate-600 mb-1">{t('writeYourInstructions')}</label>
            <textarea value={prompt} onChange={(e)=>setPrompt(e.target.value)} rows={6} className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Describe improvements you want..." />
          </div>
          <div className="flex items-center gap-3">
            <button 
              disabled={!documentId || submitting || !prompt.trim()} 
              onClick={generateImprovedDraft} 
              className="rounded-lg bg-sky-600 text-white px-4 py-2 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </>
              ) : (
                t('generateNewDraft')
              )}
            </button>
            
            {submitting && (
              <span className="text-sm text-slate-600">Please wait while we improve your draft...</span>
            )}
          </div>
        </section>

        {result && (
          <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <div className="font-medium text-slate-800">Improve Draft Result</div>
            <div className="text-sm text-slate-600">Improvements analysis</div>
            <div className="whitespace-pre-wrap text-slate-800">{result.improvements_analysis}</div>
            <div className="text-sm text-slate-600 mt-2">Updated draft</div>
            <div className="whitespace-pre-wrap text-slate-800">{result.updated_draft}</div>
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


