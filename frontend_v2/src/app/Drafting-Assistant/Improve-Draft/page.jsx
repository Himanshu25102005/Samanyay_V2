"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LanguageSelector from "../../../../components/LanguageSelector.jsx";
import Navbar from "../../../../components/Navbar.jsx";
import { useI18n } from "../../../../components/I18nProvider.jsx";

// Component that uses useSearchParams - needs to be wrapped in Suspense
function SearchParamsHandler({ onParamsLoaded }) {
  const params = useSearchParams();
  const type = params.get("type") || "Document";
  const initialDid = params.get("did") || "";
  
  // Call the callback with the params
  onParamsLoaded({ type, initialDid });
  
  return null; // This component doesn't render anything
}

function ImproveDraftContent({ type, initialDid }) {
  const { t } = useI18n();

  const [documentId, setDocumentId] = useState(initialDid || null);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  async function generateImprovedDraft() {
    setSubmitting(true);
    try {
      const body = JSON.stringify({ prompt, document_id: documentId });
      const res = await fetch("/Drafting-Assistant/api/drafting/improve?format=docx", { method: "POST", headers: { "content-type": "application/json" }, body });
      const data = await res.json();
      setResult(data?.data || null);
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
          <div className="flex items-center gap-3">
            <button onClick={onChooseFile} className="rounded-lg bg-sky-600 text-white px-4 py-2 hover:bg-sky-700">{t('uploadSupportingDocument')}</button>
            {uploading && <span className="text-sm text-slate-600">Uploading…</span>}
            {documentId && <span className="text-sm text-slate-700">document_id: <span className="font-mono">{documentId}</span></span>}
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">{t('writeYourInstructions')}</label>
            <textarea value={prompt} onChange={(e)=>setPrompt(e.target.value)} rows={6} className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Describe improvements you want..." />
          </div>
          <div className="flex items-center gap-3">
            <button disabled={!documentId || submitting} onClick={generateImprovedDraft} className="rounded-lg bg-sky-600 text-white px-4 py-2 hover:bg-sky-700 disabled:opacity-50">{t('generateNewDraft')}</button>
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

  const handleParamsLoaded = ({ type, initialDid }) => {
    setParams({ type, initialDid });
    setParamsLoaded(true);
  };

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


