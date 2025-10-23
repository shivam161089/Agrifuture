import { useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';

type TranslationKey = keyof typeof translations['en'];

export const useTranslations = () => {
  const { language } = useLanguage();

  const t = useCallback((key: TranslationKey, placeholders?: Record<string, string | number>): string => {
    // Fallback to English if the language or key is not found
    let translation = translations[language]?.[key] || translations['en'][key];

    if (placeholders) {
      Object.keys(placeholders).forEach(placeholder => {
        const regex = new RegExp(`{${placeholder}}`, 'g');
        translation = translation.replace(regex, String(placeholders[placeholder]));
      });
    }

    return translation;
  }, [language]);

  return t;
};
