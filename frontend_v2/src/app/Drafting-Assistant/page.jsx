"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSelector from "../../../components/LanguageSelector.jsx";
import Navbar from "../../../components/Navbar.jsx";
import { useI18n } from "../../../components/I18nProvider.jsx";

const DOC_TYPE_KEYS = [
    "bailApplication",
    "contract",
    "dischargeApplication",
    "legalNotice",
    "mou",
    "nda",
    "plaintComplaintPetition",
    "replyRejoinder",
    "writPetition",
    "rtiApplication",
];

// SVG Icons
const DocumentIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const LightningIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const PlusIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

const EditIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

// New distinct icons per document type (lighter style-friendly)
const ContractIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V3H8v4m8 0H8m8 0l2 2m-10-2L6 9m0 0v10a2 2 0 002 2h8a2 2 0 002-2V9m-12 0h12" />
    </svg>
);
const NoticeIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M4 6h16M6 6v12a2 2 0 002 2h8a2 2 0 002-2V6" />
    </svg>
);
const ShieldIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 5-3.5 9-7 9s-7-4-7-9V7l7-4z" />
    </svg>
);
const BalanceIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m6-11l4 7H14l4-7zm-10 0l4 7H2l4-7z" />
    </svg>
);
const HandshakeIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 11l4-3 4 3m0 0l3-2 3 2-3 2m-3-2v8a2 2 0 01-2 2H7l-2-2m3-8L5 9 2 11l3 2" />
    </svg>
);
const PenPaperIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L8 18l-4 1 1-4 11.5-11.5z" />
    </svg>
);
const ReplyIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10l7-7v4c6 0 10 3 11 9-2-3-5-4-11-4v4L3 10z" />
    </svg>
);

const WritPetitionIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

const RTIIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

function getIconForKey(key) {
    switch (key) {
        case "bailApplication":
            return <ShieldIcon />;
        case "contract":
            return <ContractIcon />;
        case "dischargeApplication":
            return <BalanceIcon />;
        case "legalNotice":
            return <NoticeIcon />;
        case "mou":
            return <HandshakeIcon />;
        case "nda":
            return <ShieldIcon />;
        case "plaintComplaintPetition":
            return <PenPaperIcon />;
        case "replyRejoinder":
            return <ReplyIcon />;
        case "writPetition":
            return <WritPetitionIcon />;
        case "rtiApplication":
            return <RTIIcon />;
        default:
            return <DocumentIcon />;
    }
}

const SearchIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
    </svg>
);

const MenuIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const getImproveButtonText = (docType) => {
    const improveTexts = {
        "Draft a Bail/Anticipatory Bail Application": "Improve Application",
        "Draft a Contract": "Improve Contract",
        "Draft a Discharge Application": "Improve Application",
        "Draft a Legal Notice": "Improve Legal Notice",
        "Draft a Memorandum of Understanding": "Improve MoU Draft",
        "Draft a Non-Disclosure Agreement": "Improve NDA",
        "Draft a Plaint/Complaint/Petition": "Improve Plaint/Complaint",
        "Draft a Reply/Rejoinder": "Improve Reply/Rejoinder",
        "Writ Petition": "Improve Writ Petition",
        "RTI Application/Appeal": "Improve RTI Application"
    };
    return improveTexts[docType] || "Improve Document";
};

export default function DraftingAssistant() {
    const { t } = useI18n();
    const [query, setQuery] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const localizedTypes = useMemo(() => {
        const base = DOC_TYPE_KEYS.map((key) => ({ 
            key, 
            label: t(`type_${key}`) 
        }));
        return [...base, { key: "general", label: t('generalPurposeDraft') }];
    }, [t]);

    const filtered = useMemo(() => {
        if (!query) return localizedTypes;
        const q = query.toLowerCase();
        return localizedTypes.filter((d) => d.label.toLowerCase().includes(q));
    }, [query, localizedTypes]);


    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-sky-50 flex flex-col">
                
                {/* Header Section */}
                <div className="sticky top-0 z-20 backdrop-blur-md bg-white/80 border-b border-slate-200/70 shadow-sm">
                    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-4.5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
                                        {t('draftingAssistant')}
                                    </h1>
                                </div>
                                <button 
                                    className="sm:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    aria-label="Toggle menu"
                                >
                                    <MenuIcon />
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <LanguageSelector />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                    
                    {/* Hero Section */}
                    {/*  */}

                    {/* Search Bar */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mb-6 sm:mb-8"
                    >
                        <div className="relative max-w-2xl mx-auto">
                            <div className="absolute  inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <SearchIcon />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t('searchDocumentTypes') || 'Search document types...'}
                                className="w-full rounded-xl sm:rounded-2xl border-2 border-slate-200 bg-white/90 
                                         pl-12 pr-4 py-3 sm:py-4 
                                         text-sm sm:text-base lg:text-lg
                                         shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent
                                         transition-all duration-200 placeholder:text-slate-400"
                            />
                        </div>
                    </motion.div>

                    {/* Document Type Grid */}
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={query}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
                        >
                            {filtered.map((item, index) => (
                                <motion.div
                                    key={item.key}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    whileHover={{ y: -4, scale: 1.01 }}
                                    className="group relative rounded-xl sm:rounded-2xl 
                                             border-2 border-sky-100 bg-white/90 
                                             p-5 sm:p-6 
                                             shadow hover:shadow-lg hover:border-sky-200
                                             transition-all duration-300"
                                >
                                    {/* Icon and Title */}
                                    <div className="flex items-start gap-4 mb-4 sm:mb-5">
                                        <div className="flex-shrink-0 h-11 w-11 sm:h-12 sm:w-12 
                                                      rounded-xl bg-gradient-to-br from-sky-50 to-indigo-50 
                                                      text-sky-700 flex items-center justify-center
                                                      group-hover:from-sky-100 group-hover:to-indigo-100
                                                      group-hover:text-sky-800
                                                      transition-all duration-300 shadow-sm">
                                            {item.key === "general" ? <LightningIcon /> : getIconForKey(item.key)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-900 
                                                         text-base sm:text-lg 
                                                         leading-tight break-words">
                                                {item.label}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {item.key === "general" ? (
                                        <div className="flex flex-col gap-2.5 sm:gap-3">
                                            <Link 
                                                href={{ 
                                                    pathname: "/Drafting-Assistant/New-Draft", 
                                                    query: { type: item.label, did: "" }
                                                }} 
                                                className="w-full"
                                            >
                                                <motion.span
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="inline-flex w-full items-center justify-center gap-2
                                                             rounded-lg sm:rounded-xl 
                                                             border-2 border-[#0818A8] bg-white text-[#0818A8] 
                                                             font-medium
                                                             px-4 py-2.5 sm:py-3
                                                             text-sm sm:text-base
                                                             hover:bg-[#0818A8]/5 hover:border-[#0A1BB8]
                                                             shadow-sm hover:shadow
                                                             transition-all duration-200"
                                                >
                                                    <div className="w-4 h-4 sm:w-5 sm:h-5">
                                                        <PlusIcon />
                                                    </div>
                                                    <span>{t('makeNewDraft') || 'Create New'}</span>
                                                </motion.span>
                                            </Link>
                                            <Link 
                                                href={{ 
                                                    pathname: "/Drafting-Assistant/Improve-Draft", 
                                                    query: { type: item.label, did: "" }
                                                }} 
                                                className="w-full"
                                            >
                                                <motion.span
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="inline-flex w-full items-center justify-center gap-2
                                                             rounded-lg sm:rounded-xl 
                                                             bg-[#0818A8] 
                                                             text-white font-medium
                                                             px-4 py-2.5 sm:py-3
                                                             text-sm sm:text-base
                                                             hover:bg-[#0A1BB8]
                                                             shadow-md hover:shadow-lg
                                                             transition-all duration-200"
                                                >
                                                    <div className="w-4 h-4 sm:w-5 sm:h-5">
                                                        <EditIcon />
                                                    </div>
                                                    <span>Improve General Draft</span>
                                                </motion.span>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2.5 sm:gap-3">
                                            <Link 
                                                href={{ 
                                                    pathname: "/Drafting-Assistant/New-Draft", 
                                                    query: { type: item.label, did: "" }
                                                }} 
                                                className="w-full"
                                            >
                                                <motion.span
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="inline-flex w-full items-center justify-center gap-2
                                                             rounded-lg sm:rounded-xl 
                                                             border-2 border-[#0818A8] bg-white text-[#0818A8] 
                                                             font-medium
                                                             px-4 py-2.5 sm:py-3
                                                             text-sm sm:text-base
                                                             hover:bg-[#0818A8]/5 hover:border-[#0A1BB8]
                                                             shadow-sm hover:shadow
                                                             transition-all duration-200"
                                                >
                                                    <div className="w-4 h-4 sm:w-5 sm:h-5">
                                                        <PlusIcon />
                                                    </div>
                                                    <span>{t('makeNewDraft') || 'Create New'}</span>
                                                </motion.span>
                                            </Link>
                                            <Link 
                                                href={{ 
                                                    pathname: "/Drafting-Assistant/Improve-Draft", 
                                                    query: { type: item.label, did: "" }
                                                }} 
                                                className="w-full"
                                            >
                                                <motion.span
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="inline-flex w-full items-center justify-center gap-2
                                                             rounded-lg sm:rounded-xl 
                                                             bg-[#0818A8] 
                                                             text-white font-medium
                                                             px-4 py-2.5 sm:py-3
                                                             text-sm sm:text-base
                                                             hover:bg-[#0A1BB8]
                                                             shadow-md hover:shadow-lg
                                                             transition-all duration-200"
                                                >
                                                    <div className="w-4 h-4 sm:w-5 sm:h-5">
                                                        <EditIcon />
                                                    </div>
                                                    <span>{getImproveButtonText(item.label)}</span>
                                                </motion.span>
                                            </Link>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* No Results Message */}
                    {filtered.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 sm:py-16"
                        >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-slate-300">
                                <DocumentIcon />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
                                {t('noResultsFound') || 'No Results Found'}
                            </h3>
                            <p className="text-sm sm:text-base text-slate-600">
                                {t('tryDifferentSearch') || 'Try adjusting your search terms'}
                            </p>
                        </motion.div>
                    )}
                </main>
            </div>
        </>
    );
}