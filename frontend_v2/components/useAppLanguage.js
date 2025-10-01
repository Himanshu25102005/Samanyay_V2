'use client'
import { useEffect, useState, useCallback } from 'react';

const KEY = 'app_language';
const DEFAULT_LANG = 'English';

export function getStoredLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANG;
  try {
    return localStorage.getItem(KEY) || DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

export function setStoredLanguage(lang) {
  try {
    localStorage.setItem(KEY, lang);
    window.dispatchEvent(new CustomEvent('app-language-change', { detail: lang }));
  } catch {}
}

export default function useAppLanguage() {
  const [language, setLanguage] = useState(getStoredLanguage());

  useEffect(() => {
    const handler = (e) => {
      const value = e?.detail || getStoredLanguage();
      setLanguage(value);
    };
    window.addEventListener('app-language-change', handler);
    return () => window.removeEventListener('app-language-change', handler);
  }, []);

  const updateLanguage = useCallback((lang) => {
    setLanguage(lang);
    setStoredLanguage(lang);
  }, []);

  return { language, setLanguage: updateLanguage };
}



