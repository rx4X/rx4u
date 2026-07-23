import {useLanguage} from './LanguageProvider';

interface LanguageToggleProps {
  class?: string;
}

export function LanguageToggle(props: LanguageToggleProps) {
  const {language, setLanguage} = useLanguage();

  return (
    <div class={props.class ?? 'language-switch'} aria-label={language() === 'zh' ? '语言选择' : 'Language selector'}>
      <button
        type="button"
        class={language() === 'en' ? 'is-selected' : ''}
        onClick={() => setLanguage('en')}
        aria-pressed={language() === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        class={language() === 'zh' ? 'is-selected' : ''}
        onClick={() => setLanguage('zh')}
        aria-pressed={language() === 'zh'}
      >
        中文
      </button>
    </div>
  );
}
