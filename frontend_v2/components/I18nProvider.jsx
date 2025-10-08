'use client'
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getStoredLanguage } from './useAppLanguage';

const I18nContext = createContext({ t: (k)=>k, lang: 'English', setLang: ()=>{} });

const DICT = {
  English: {
    // Navigation
    home: 'Home',
    dashboard: 'Dashboard',
    legalResearch: 'Legal Research',
    documentAnalysis: 'Document Analysis',
    draftingAssistant: 'Drafting Assistant',
    logout: 'Logout',
    
    // Document Analysis
    chatWithDoc: 'Chat with Document',
    uploadToStart: 'Upload a document to start chatting',
    dragDropHint: 'Drag & drop or choose a file. Supported: PDF, DOCX, TXT.',
    chooseFile: 'Choose File',
    uploading: 'Uploading…',
    selected: 'Selected',
    file: 'file',
    bytes: 'bytes',
    
    // Chat Interface
    send: 'Send',
    thinking: 'Thinking…',
    typing: 'Typing…',
    askPlaceholder: 'Ask a question…',
    recording: 'Recording...',
    stopRecording: 'Stop recording',
    startVoiceRecording: 'Start voice recording',
    pressEnterHint: 'Press Enter to send, Shift+Enter for newline. Click mic to record voice message.',
    
    // Drafting Assistant
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
    
    // Common
    language: 'Language',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    refresh: 'Refresh',
    download: 'Download',
    upload: 'Upload',
    submit: 'Submit',
    reset: 'Reset',
    clear: 'Clear',
    select: 'Select',
    all: 'All',
    none: 'None',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    retry: 'Retry',
    continue: 'Continue',
    finish: 'Finish',
    complete: 'Complete',
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    warning: 'Warning',
    info: 'Information',
    help: 'Help',
    about: 'About',
    settings: 'Settings',
    profile: 'Profile',
    account: 'Account',
    preferences: 'Preferences',
    notifications: 'Notifications',
    privacy: 'Privacy',
    security: 'Security',
    terms: 'Terms',
    conditions: 'Conditions',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    contact: 'Contact',
    support: 'Support',
    feedback: 'Feedback',
    report: 'Report',
    version: 'Version',
    copyright: 'Copyright',
    rights: 'Rights',
    reserved: 'Reserved'
  },
  Hindi: {
    // Navigation
    home: 'होम',
    dashboard: 'डैशबोर्ड',
    legalResearch: 'कानूनी अनुसंधान',
    documentAnalysis: 'दस्तावेज़ विश्लेषण',
    draftingAssistant: 'ड्राफ्टिंग असिस्टेंट',
    logout: 'लॉग आउट',
    
    // Document Analysis
    chatWithDoc: 'दस्तावेज़ से चैट करें',
    uploadToStart: 'चैट शुरू करने के लिए दस्तावेज़ अपलोड करें',
    dragDropHint: 'फ़ाइल ड्रैग-ड्रॉप करें या चुनें। समर्थित: PDF, DOCX, TXT।',
    chooseFile: 'फ़ाइल चुनें',
    uploading: 'अपलोड हो रहा है…',
    selected: 'चयनित',
    file: 'फ़ाइल',
    bytes: 'बाइट्स',
    
    // Chat Interface
    send: 'भेजें',
    thinking: 'सोचा जा रहा है…',
    typing: 'टाइप कर रहे हैं…',
    askPlaceholder: 'प्रश्न पूछें…',
    recording: 'रिकॉर्डिंग...',
    stopRecording: 'रिकॉर्डिंग रोकें',
    startVoiceRecording: 'वॉइस रिकॉर्डिंग शुरू करें',
    pressEnterHint: 'भेजने के लिए Enter दबाएं, नई लाइन के लिए Shift+Enter। वॉइस मैसेज रिकॉर्ड करने के लिए माइक पर क्लिक करें।',
    
    // Drafting Assistant
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
    
    // Common
    language: 'भाषा',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    save: 'सहेजें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    close: 'बंद करें',
    back: 'वापस',
    next: 'अगला',
    previous: 'पिछला',
    search: 'खोजें',
    filter: 'फिल्टर',
    sort: 'क्रमबद्ध करें',
    refresh: 'रिफ्रेश करें',
    download: 'डाउनलोड',
    upload: 'अपलोड',
    submit: 'सबमिट करें',
    reset: 'रीसेट करें',
    clear: 'साफ करें',
    select: 'चुनें',
    all: 'सभी',
    none: 'कोई नहीं',
    yes: 'हाँ',
    no: 'नहीं',
    ok: 'ठीक है',
    retry: 'पुनः प्रयास करें',
    continue: 'जारी रखें',
    finish: 'समाप्त करें',
    complete: 'पूर्ण करें',
    pending: 'लंबित',
    processing: 'प्रसंस्करण',
    completed: 'पूर्ण',
    failed: 'असफल',
    warning: 'चेतावनी',
    info: 'जानकारी',
    help: 'सहायता',
    about: 'के बारे में',
    settings: 'सेटिंग्स',
    profile: 'प्रोफाइल',
    account: 'खाता',
    preferences: 'प्राथमिकताएं',
    notifications: 'सूचनाएं',
    privacy: 'गोपनीयता',
    security: 'सुरक्षा',
    terms: 'नियम',
    conditions: 'शर्तें',
    privacyPolicy: 'गोपनीयता नीति',
    termsOfService: 'सेवा की शर्तें',
    contact: 'संपर्क',
    support: 'सहायता',
    feedback: 'फीडबैक',
    report: 'रिपोर्ट',
    version: 'संस्करण',
    copyright: 'कॉपीराइट',
    rights: 'अधिकार',
    reserved: 'आरक्षित'
  },
  Marathi: {
    // Navigation
    home: 'होम',
    dashboard: 'डॅशबोर्ड',
    legalResearch: 'कायदेशीर संशोधन',
    documentAnalysis: 'दस्तऐवज विश्लेषण',
    draftingAssistant: 'मसुदा सहाय्यक',
    logout: 'लॉग आउट',
    
    // Document Analysis
    chatWithDoc: 'दस्तऐवजाशी संवाद',
    uploadToStart: 'संवाद सुरू करण्यासाठी दस्तऐवज अपलोड करा',
    dragDropHint: 'फाइल ड्रॅग-ड्रॉप करा किंवा निवडा. समर्थित: PDF, DOCX, TXT.',
    chooseFile: 'फाइल निवडा',
    uploading: 'अपलोड होत आहे…',
    selected: 'निवडलेले',
    file: 'फाइल',
    bytes: 'बाइट्स',
    
    // Chat Interface
    send: 'पाठवा',
    thinking: 'विचार करत आहे…',
    typing: 'टाइप करत आहे…',
    askPlaceholder: 'प्रश्न विचारा…',
    recording: 'रेकॉर्डिंग...',
    stopRecording: 'रेकॉर्डिंग थांबवा',
    startVoiceRecording: 'व्हॉइस रेकॉर्डिंग सुरू करा',
    pressEnterHint: 'पाठवण्यासाठी Enter दाबा, नवीन ओळीसाठी Shift+Enter. व्हॉइस मेसेज रेकॉर्ड करण्यासाठी माइकवर क्लिक करा.',
    
    // Drafting Assistant
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
    
    // Common
    language: 'भाषा',
    loading: 'लोड होत आहे...',
    error: 'त्रुटी',
    success: 'यश',
    cancel: 'रद्द करा',
    confirm: 'पुष्टी करा',
    save: 'जतन करा',
    delete: 'हटवा',
    edit: 'संपादित करा',
    close: 'बंद करा',
    back: 'मागे',
    next: 'पुढे',
    previous: 'मागील',
    search: 'शोधा',
    filter: 'फिल्टर',
    sort: 'क्रमवारी',
    refresh: 'रिफ्रेश करा',
    download: 'डाउनलोड',
    upload: 'अपलोड',
    submit: 'सबमिट करा',
    reset: 'रीसेट करा',
    clear: 'साफ करा',
    select: 'निवडा',
    all: 'सर्व',
    none: 'काहीही नाही',
    yes: 'होय',
    no: 'नाही',
    ok: 'ठीक आहे',
    retry: 'पुन्हा प्रयत्न करा',
    continue: 'सुरू ठेवा',
    finish: 'समाप्त करा',
    complete: 'पूर्ण करा',
    pending: 'प्रलंबित',
    processing: 'प्रक्रिया',
    completed: 'पूर्ण',
    failed: 'अयशस्वी',
    warning: 'चेतावणी',
    info: 'माहिती',
    help: 'मदत',
    about: 'बद्दल',
    settings: 'सेटिंग्ज',
    profile: 'प्रोफाइल',
    account: 'खाते',
    preferences: 'प्राधान्ये',
    notifications: 'सूचना',
    privacy: 'गोपनीयता',
    security: 'सुरक्षा',
    terms: 'अटी',
    conditions: 'अटी',
    privacyPolicy: 'गोपनीयता धोरण',
    termsOfService: 'सेवा अटी',
    contact: 'संपर्क',
    support: 'समर्थन',
    feedback: 'अभिप्राय',
    report: 'अहवाल',
    version: 'आवृत्ती',
    copyright: 'कॉपीराइट',
    rights: 'अधिकार',
    reserved: 'आरक्षित'
  },
  Gujarati: {
    // Navigation
    home: 'હોમ',
    dashboard: 'ડેશબોર્ડ',
    legalResearch: 'કાનૂની સંશોધન',
    documentAnalysis: 'દસ્તાવેજ વિશ્લેષણ',
    draftingAssistant: 'ડ્રાફ્ટિંગ સહાયક',
    logout: 'લોગ આઉટ',
    
    // Document Analysis
    chatWithDoc: 'દસ્તાવેજ સાથે ચેટ કરો',
    uploadToStart: 'ચેટ શરૂ કરવા માટે દસ્તાવેજ અપલોડ કરો',
    dragDropHint: 'ફાઇલ ડ્રેગ-ડ્રોપ કરો અથવા પસંદ કરો. સપોર્ટેડ: PDF, DOCX, TXT.',
    chooseFile: 'ફાઇલ પસંદ કરો',
    uploading: 'અપલોડ થઈ રહ્યું છે…',
    selected: 'પસંદ કરેલ',
    file: 'ફાઇલ',
    bytes: 'બાઇટ્સ',
    
    // Chat Interface
    send: 'મોકલો',
    thinking: 'વિચાર કરવામાં…',
    typing: 'ટાઈપ કરવામાં…',
    askPlaceholder: 'પ્રશ્ન પૂછો…',
    recording: 'રેકોર્ડિંગ...',
    stopRecording: 'રેકોર્ડિંગ બંધ કરો',
    startVoiceRecording: 'વોઇસ રેકોર્ડિંગ શરૂ કરો',
    pressEnterHint: 'મોકલવા માટે Enter દબાવો, નવી લાઇન માટે Shift+Enter. વોઇસ મેસેજ રેકોર્ડ કરવા માટે માઇક પર ક્લિક કરો.',
    
    // Drafting Assistant
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
    
    // Common
    language: 'ભાષા',
    loading: 'લોડ થઈ રહ્યું છે...',
    error: 'ભૂલ',
    success: 'સફળતા',
    cancel: 'રદ કરો',
    confirm: 'પુષ્ટિ કરો',
    save: 'સેવ કરો',
    delete: 'ડિલીટ કરો',
    edit: 'એડિટ કરો',
    close: 'બંધ કરો',
    back: 'પાછળ',
    next: 'આગળ',
    previous: 'પહેલાનું',
    search: 'શોધો',
    filter: 'ફિલ્ટર',
    sort: 'સોર્ટ કરો',
    refresh: 'રિફ્રેશ કરો',
    download: 'ડાઉનલોડ',
    upload: 'અપલોડ',
    submit: 'સબમિટ કરો',
    reset: 'રીસેટ કરો',
    clear: 'ક્લિયર કરો',
    select: 'પસંદ કરો',
    all: 'બધા',
    none: 'કોઈ નહીં',
    yes: 'હા',
    no: 'ના',
    ok: 'ઠીક છે',
    retry: 'ફરી પ્રયાસ કરો',
    continue: 'ચાલુ રાખો',
    finish: 'સમાપ્ત કરો',
    complete: 'પૂર્ણ કરો',
    pending: 'પેન્ડિંગ',
    processing: 'પ્રોસેસિંગ',
    completed: 'પૂર્ણ',
    failed: 'અસફળ',
    warning: 'ચેતવણી',
    info: 'માહિતી',
    help: 'મદદ',
    about: 'વિશે',
    settings: 'સેટિંગ્સ',
    profile: 'પ્રોફાઇલ',
    account: 'એકાઉન્ટ',
    preferences: 'પસંદગીઓ',
    notifications: 'સૂચનાઓ',
    privacy: 'ગોપનીયતા',
    security: 'સુરક્ષા',
    terms: 'નિયમો',
    conditions: 'શરતો',
    privacyPolicy: 'ગોપનીયતા નીતિ',
    termsOfService: 'સેવાની શરતો',
    contact: 'સંપર્ક',
    support: 'સપોર્ટ',
    feedback: 'ફીડબેક',
    report: 'રિપોર્ટ',
    version: 'વર્ઝન',
    copyright: 'કોપીરાઇટ',
    rights: 'અધિકારો',
    reserved: 'આરક્ષિત'
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

// Utility function to get font class based on language
export function getFontClass(language) {
  switch (language) {
    case 'Hindi':
      return 'font-hindi';
    case 'Marathi':
      return 'font-marathi';
    case 'Gujarati':
      return 'font-gujarati';
    default:
      return 'font-english';
  }
}



