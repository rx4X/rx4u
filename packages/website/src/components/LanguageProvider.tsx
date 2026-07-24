import {createContext, createSignal, useContext, type ParentProps} from 'solid-js';

export type Language = 'en' | 'zh';

interface LanguageContextType {
  language: () => Language;
  setLanguage: (language: Language) => void;
}

interface LanguageProviderProps extends ParentProps {
  initialLanguage: Language;
}

const LanguageContext = createContext<LanguageContextType>();

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
}

export function LanguageProvider(props: LanguageProviderProps) {
  const [language, setLanguageSignal] = createSignal<Language>(props.initialLanguage);

  function setLanguage(newLanguage: Language) {
    const locale = newLanguage === 'zh' ? 'zh-CN' : 'en-US';
    const url = new URL(window.location.href);

    setLanguageSignal(newLanguage);
    localStorage.setItem('rx4u-language', newLanguage);
    document.documentElement.lang = newLanguage === 'zh' ? 'zh-CN' : 'en';
    document.cookie = `locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;

    const pathname = url.pathname.replace(/^\/(?:en-US|zh-CN)(?=\/|$)/, '') || '/';
    url.pathname = pathname;

    if (url.pathname !== window.location.pathname) {
      window.location.assign(url.toString());
    }
  }

  return <LanguageContext.Provider value={{language, setLanguage}}>{props.children}</LanguageContext.Provider>;
}
