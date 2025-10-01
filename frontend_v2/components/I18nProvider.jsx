'use client'
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getStoredLanguage } from './useAppLanguage';

const I18nContext = createContext({ t: (k)=>k, lang: 'English', setLang: ()=>{} });

const DICT = {
  English: {
    documentAnalysis: 'Document Analysis',
    draftingAssistant: 'Drafting Assistant',
    generalPurposeDraft: 'General Purpose Draft',
    searchDocumentTypes: 'Search Document Types',
    uploadSupportingDocument: 'Upload Supporting Document',
    writeYourInstructions: 'Write your instructions',
    startVoicePrompt: 'Start Voice Prompt',
    stopAndSubmit: 'Stop & Submit',
    generateNewDraft: 'Generate New Draft',
    makeNewDraft: 'Make a New Draft',
    improveDocument: 'Improve a Document',
    selectedType: 'Selected type',
    chooseFeature: "Choose a feature to get started.",
    start: 'Start',
    analyseSpecific: 'Analyse Specific Document',
    chatWithDoc: 'Chat With Your Document',
    uploadToStart: 'Upload a document to start chatting',
    dragDropHint: 'Drag & drop or choose a file. Supported: PDF, DOCX, TXT.',
    send: 'Send', thinking: 'Thinking…', typing: 'Typing…',
    language: 'Language', askPlaceholder: 'Ask a question…'
  },
  Hindi: {
    documentAnalysis: 'दस्तावेज़ विश्लेषण',
    draftingAssistant: 'ड्राफ्टिंग असिस्टेंट',
    generalPurposeDraft: 'सामान्य ड्राफ्ट',
    searchDocumentTypes: 'दस्तावेज़ प्रकार खोजें',
    uploadSupportingDocument: 'समर्थन दस्तावेज़ अपलोड करें',
    writeYourInstructions: 'अपनी निर्देश लिखें',
    startVoicePrompt: 'वॉइस प्रॉम्प्ट शुरू करें',
    stopAndSubmit: 'रोकें और सबमिट करें',
    generateNewDraft: 'नया ड्राफ्ट बनाएं',
    makeNewDraft: 'नया ड्राफ्ट बनाएं',
    improveDocument: 'दस्तावेज़ सुधारें',
    selectedType: 'चयनित प्रकार',
    chooseFeature: 'शुरू करने के लिए एक विकल्प चुनें।',
    start: 'शुरू करें',
    analyseSpecific: 'विशिष्ट दस्तावेज़ का विश्लेषण',
    chatWithDoc: 'अपने दस्तावेज़ से चैट करें',
    uploadToStart: 'चैट शुरू करने के लिए दस्तावेज़ अपलोड करें',
    dragDropHint: 'फ़ाइल ड्रैग-ड्रॉप करें या चुनें। समर्थित: PDF, DOCX, TXT।',
    send: 'भेजें', thinking: 'सोचा जा रहा है…', typing: 'टाइप कर रहे हैं…',
    language: 'भाषा', askPlaceholder: 'प्रश्न पूछें…'
  },
  Marathi: {
    documentAnalysis: 'दस्तऐवज विश्लेषण',
    draftingAssistant: 'मसुदा सहाय्यक',
    generalPurposeDraft: 'सामान्य मसुदा',
    searchDocumentTypes: 'दस्तऐवज प्रकार शोधा',
    uploadSupportingDocument: 'समर्थन दस्तऐवज अपलोड करा',
    writeYourInstructions: 'आपली सूचना लिहा',
    startVoicePrompt: 'व्हॉइस प्रॉम्प्ट सुरू करा',
    stopAndSubmit: 'थांबवा आणि सबमिट करा',
    generateNewDraft: 'नवा मसुदा तयार करा',
    makeNewDraft: 'नवा मसुदा तयार करा',
    improveDocument: 'दस्तऐवज सुधारित करा',
    selectedType: 'निवडलेला प्रकार',
    chooseFeature: 'सुरू करण्यासाठी पर्याय निवडा.',
    start: 'सुरू करा',
    analyseSpecific: 'विशिष्ट दस्तऐवजाचे विश्लेषण',
    chatWithDoc: 'तुमच्या दस्तऐवजाशी संवाद',
    uploadToStart: 'संवाद सुरू करण्यासाठी दस्तऐवज अपलोड करा',
    dragDropHint: 'फाइल ड्रॅग-ड्रॉप करा किंवा निवडा. समर्थित: PDF, DOCX, TXT.',
    send: 'पाठवा', thinking: 'विचार करत आहे…', typing: 'टाइप करत आहे…',
    language: 'भाषा', askPlaceholder: 'प्रश्न विचारा…'
  },
  Gujarati: {
    documentAnalysis: 'દસ્તાવેજ વિશ્લેષણ',
    draftingAssistant: 'ડ્રાફ્ટિંગ સહાયક',
    generalPurposeDraft: 'સામાન્ય ડ્રાફ્ટ',
    searchDocumentTypes: 'દસ્તાવેજ પ્રકારો શોધો',
    uploadSupportingDocument: 'સમર્થક દસ્તાવેજ અપલોડ કરો',
    writeYourInstructions: 'તમારી સૂચનાઓ લખો',
    startVoicePrompt: 'વોઇસ પ્રોમ્પ્ટ શરૂ કરો',
    stopAndSubmit: 'બંધ કરો અને સબમિટ કરો',
    generateNewDraft: 'નવો ડ્રાફ્ટ બનાવો',
    makeNewDraft: 'નવો ડ્રાફ્ટ બનાવો',
    improveDocument: 'દસ્તાવેજ સુધારો',
    selectedType: 'પસંદ કરેલ પ્રકાર',
    chooseFeature: 'શરૂઆત માટે એક વિકલ્પ પસંદ કરો.',
    start: 'શરૂ કરો',
    analyseSpecific: 'વિશેષ દસ્તાવેજ વિશ્લેષણ',
    chatWithDoc: 'તમારા દસ્તાવેજ સાથે ચેટ કરો',
    uploadToStart: 'ચેટ શરૂ કરવા માટે દસ્તાવેજ અપલોડ કરો',
    dragDropHint: 'ફાઇલ ડ્રેગ-ડ્રોપ કરો અથવા પસંદ કરો. સપોર્ટેડ: PDF, DOCX, TXT.',
    send: 'મોકલો', thinking: 'વિચાર કરવામાં…', typing: 'ટાઈપ કરવામાં…',
    language: 'ભાષા', askPlaceholder: 'પ્રશ્ન પૂછો…'
  }
};

export default function I18nProvider({ children }) {
  const [lang, setLang] = useState(getStoredLanguage());

  useEffect(() => {
    const h = (e) => setLang(e?.detail || getStoredLanguage());
    window.addEventListener('app-language-change', h);
    return () => window.removeEventListener('app-language-change', h);
  }, []);

  const t = useMemo(() => {
    const dict = DICT[lang] || DICT.English;
    return (key) => dict[key] ?? key;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ t, lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() { return useContext(I18nContext); }



