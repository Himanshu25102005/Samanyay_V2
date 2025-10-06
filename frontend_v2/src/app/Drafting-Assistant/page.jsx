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
    "Draft a Reply/Rejoinder",
].sort();

// Custom improve button text for each document type
const getImproveButtonText = (docType) => {
    const improveTexts = {
        "Draft a Bail/Anticipatory Bail Application": "Improve Application",
        "Draft a Contract": "Improve Contract",
        "Draft a Discharge Application": "Improve Application",
        "Draft a Legal Notice": "Improve Legal Notice",
        "Draft a Memorandum of Understanding": "Improve MoU Draft",
        "Draft a Non-Disclosure Agreement": "Improve NDA",
        "Draft a Plaint/Complaint/Petition": "Improve Plaint/Complaint",
        "Draft a Reply/Rejoinder": "Improve Reply/Rejoinder"
    };
    return improveTexts[docType] || "Improve Document";
};

export default function DraftingAssistant() {
    const { t } = useI18n();
    const [query, setQuery] = useState("");
    const [documentId, setDocumentId] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const filtered = useMemo(() => {
        const allTypes = [...DOC_TYPES, "General Purpose Draft"];
        if (!query) return allTypes;
        return allTypes.filter((d) => d.toLowerCase().includes(query.toLowerCase()));
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
            {/* Main container with responsive margins */}
            <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 
                            lg:ml-[250px] md:ml-[100px] sm:ml-20 ml-20 
                            transition-all duration-300">
                
                {/* Sticky header with responsive padding */}
                <div className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-slate-200">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                        <div className="flex items-center justify-between gap-4">
                            {/* Mobile menu button (shows on small screens if navbar is collapsible) */}
                            <button 
                                className="lg:hidden md:hidden sm:block block p-2 rounded-lg hover:bg-slate-100"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Toggle menu"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                          d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            
                            {/* Title with responsive text size */}
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-sky-800 
                                         flex-1 lg:flex-none">
                                {t('draftingAssistant')}
                            </h1>
                            
                            {/* Language selector */}
                            <div className="flex-shrink-0">
                                <LanguageSelector />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content with responsive padding and max-width */}
                <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
                    {/* Search input */}
                    <div className="w-full">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('searchDocumentTypes')}
                            className="w-full rounded-xl border border-slate-300 bg-white 
                                     px-3 sm:px-4 py-2.5 sm:py-3 
                                     text-sm sm:text-base
                                     shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500
                                     transition-all duration-200"
                        />
                    </div>

                    {/* Responsive grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 
                                  gap-3 sm:gap-4 lg:gap-5">
                        {filtered.map((name) => (
                            <motion.div
                                key={name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -2 }}
                                className="group relative rounded-xl sm:rounded-2xl 
                                         border border-slate-200 bg-white 
                                         p-4 sm:p-5 
                                         shadow-sm hover:shadow-md 
                                         transition-all duration-200"
                            >
                                {/* Card header */}
                                <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 
                                                  rounded-full bg-sky-50 text-sky-700 
                                                  flex items-center justify-center flex-shrink-0
                                                  text-sm sm:text-base">
                                        {name === "General Purpose Draft" ? "⚡" : "📄"}
                                    </div>
                                    <div className="font-medium text-slate-800 
                                                  text-sm sm:text-base 
                                                  break-words flex-1">
                                        {name}
                                    </div>
                                </div>

                                {/* Action buttons */}
                                {name === "General Purpose Draft" ? (
                                    <div className="mt-3 sm:mt-4">
                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleGeneralPurposeUpload}
                                            className="w-full inline-flex items-center justify-center 
                                                     rounded-lg bg-sky-600 text-white 
                                                     px-3 py-2 
                                                     text-sm sm:text-base
                                                     hover:bg-sky-700 transition-colors"
                                        >
                                            {t('generalPurposeDraft')}
                                        </motion.button>
                                        {documentId && (
                                            <div className="mt-2 text-xs text-slate-500 break-all">
                                                document_id: <span className="font-mono">{documentId}</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3 
                                                  opacity-100 lg:opacity-0 lg:group-hover:opacity-100 
                                                  transition-opacity duration-200">
                                        <Link 
                                            href={{ 
                                                pathname: "/Drafting-Assistant/New-Draft", 
                                                query: { type: name, did: documentId || "" }
                                            }} 
                                            className="flex-1"
                                        >
                                            <motion.span
                                                whileTap={{ scale: 0.98 }}
                                                className="inline-flex w-full items-center justify-center 
                                                         rounded-lg border border-sky-600 text-sky-700 
                                                         px-3 py-2 
                                                         hover:bg-sky-50 
                                                         min-h-[36px] sm:min-h-[40px] 
                                                         text-xs sm:text-sm
                                                         transition-colors duration-200"
                                            >
                                                {t('makeNewDraft')}
                                            </motion.span>
                                        </Link>
                                        <Link 
                                            href={{ 
                                                pathname: "/Drafting-Assistant/Improve-Draft", 
                                                query: { type: name, did: documentId || "" }
                                            }} 
                                            className="flex-1"
                                        >
                                            <motion.span
                                                whileTap={{ scale: 0.98 }}
                                                className="inline-flex w-full items-center justify-center 
                                                         rounded-lg bg-sky-600 text-white 
                                                         px-3 py-2 
                                                         hover:bg-sky-700 
                                                         min-h-[36px] sm:min-h-[40px] 
                                                         text-xs sm:text-sm
                                                         transition-colors duration-200"
                                            >
                                                {getImproveButtonText(name)}
                                            </motion.span>
                                        </Link>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}