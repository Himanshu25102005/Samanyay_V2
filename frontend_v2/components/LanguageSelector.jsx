'use client'
import useAppLanguage, { setStoredLanguage } from './useAppLanguage';

const LANGS = [
  { value: 'English', label: 'English' },
  { value: 'Hindi', label: 'हिन्दी' },
  { value: 'Marathi', label: 'मराठी' },
  { value: 'Gujarati', label: 'ગુજરાતી' },
];

export default function LanguageSelector({ className = '' }) {
  const { language, setLanguage } = useAppLanguage();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-sm text-gray-600">Language</label>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        aria-label="Select application language"
      >
        {LANGS.map(l => (
          <option key={l.value} value={l.value}>{l.label}</option>
        ))}
      </select>
    </div>
  );
}

// helper to read globally
export function getAppLanguage() {
  if (typeof window === 'undefined') return 'English';
  try { return localStorage.getItem('app_language') || 'English'; } catch { return 'English'; }
}



