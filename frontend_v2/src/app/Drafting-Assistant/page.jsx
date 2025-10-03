"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import LanguageSelector from "../../../components/LanguageSelector.jsx";
import Navbar from "../../../components/Navbar.jsx";
import { useI18n } from "../../../components/I18nProvider.jsx";

const DOC_TYPES = [
    "Draft a Bail/Anticipatory Bail Application",
    "Draft a Contract",
    "Draft a Discharge Application",
    "Draft a Legal Notice",
    "Draft a Memorandum of Understanding",
    "Draft a Non-Disclosure Agreement",
    "Draft a Plaint/Complaint/Petition",
    "Draft a Rent Agreement",
    "Draft a Reply/Rejoinder",
].sort();

export default function DraftingAssistant() {
    const { t } = useI18n();
    const [query, setQuery] = useState("");
    const [documentId, setDocumentId] = useState(null);

    const filtered = useMemo(() => {
        if (!query) return DOC_TYPES;
        return DOC_TYPES.filter((d) => d.toLowerCase().includes(query.toLowerCase()));
    }, [query]);

    async function handleGeneralPurposeUpload() {
        const fd = new FormData();
        fd.append("file", new Blob(["dummy"], { type: "text/plain" }), "dummy.txt");
        const res = await fetch("/Drafting-Assistant/api/drafting/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data?.data?.document_id) setDocumentId(data.data.document_id);
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <button
                        onClick={handleGeneralPurposeUpload}
                        className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 transition-colors shadow-sm"
                    >
                        {t('generalPurposeDraft')}
                    </button>
                    {documentId && (
                        <div className="text-sm text-slate-600">document_id: <span className="font-mono">{documentId}</span></div>
                    )}
                </div>

                <div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('searchDocumentTypes')}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((name) => (
                        <motion.div
                            key={name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -2 }}
                            className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex h-25  items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center">📄</div>
                                <div className="font-medium text-slate-800">{name}</div>
                            </div>

                            <div className="mt-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link href={{ pathname: "/Drafting-Assistant/New-Draft", query: { type: name, did: documentId || "" }}} className="flex-1">
                                    <motion.span
                                        whileTap={{ scale: 0.98 }}
                                        className="inline-flex w-full items-center justify-center rounded-lg border border-sky-600 text-sky-700 px-3 py-2 hover:bg-sky-50"
                                    >
                                        {t('makeNewDraft')}
                                    </motion.span>
                                </Link>
                                <Link href={{ pathname: "/Drafting-Assistant/Improve-Draft", query: { type: name, did: documentId || "" }}} className="flex-1">
                                    <motion.span
                                        whileTap={{ scale: 0.98 }}
                                        className="inline-flex w-full items-center justify-center rounded-lg bg-sky-600 text-white px-3 py-2 hover:bg-sky-700"
                                    >
                                        {t('improveDocument')}
                                    </motion.span>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>
            </div>
        </>
    );
}
