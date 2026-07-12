/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language } from '../types';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  currentLanguage, 
  onLanguageChange 
}) => {
  const languages: { code: Language; label: string; nativeLabel: string }[] = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
    { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' }
  ];

  return (
    <div className="flex items-center gap-2 bg-emerald-950/40 rounded-lg p-1 border border-emerald-800/40" id="language-selector-container">
      <Globe className="w-4 h-4 text-emerald-200 ml-1.5" />
      <div className="flex gap-1" id="language-selector-buttons">
        {languages.map((lang) => (
          <button
            key={lang.code}
            id={`lang-btn-${lang.code}`}
            onClick={() => onLanguageChange(lang.code)}
            className={`px-3 py-1 text-xs font-black rounded transition-all uppercase ${
              currentLanguage === lang.code
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-emerald-800'
            }`}
          >
            <span className="hidden sm:inline">{lang.label} ({lang.nativeLabel})</span>
            <span className="sm:hidden">{lang.nativeLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
