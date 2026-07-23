import {createContext, createSignal, onMount, useContext, type ParentProps} from 'solid-js';

export type Language = 'en' | 'zh';

interface LanguageContextType {
  language: () => Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>();

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
}

export function LanguageProvider(props: ParentProps) {
  const [language, setLanguageSignal] = createSignal<Language>('en');

  function setLanguage(newLanguage: Language) {
    setLanguageSignal(newLanguage);
    localStorage.setItem('rx4u-language', newLanguage);
    document.documentElement.lang = newLanguage === 'zh' ? 'zh-CN' : 'en';
  }

  onMount(() => {
    const savedLanguage = localStorage.getItem('rx4u-language');
    const browserLanguage = navigator.language.toLowerCase();
    const initialLanguage: Language = savedLanguage === 'zh' || (!savedLanguage && browserLanguage.startsWith('zh')) ? 'zh' : 'en';
    setLanguage(initialLanguage);
  });

  return <LanguageContext.Provider value={{language, setLanguage}}>{props.children}</LanguageContext.Provider>;
}
