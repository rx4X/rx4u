import {createSignal, onCleanup} from 'solid-js';

import {useLanguage} from './LanguageProvider';

interface CodeBlockProps {
  code: string;
  language?: string;
  copyLabel?: string;
  copiedLabel?: string;
}

interface CodeToken {
  text: string;
  type?: 'comment' | 'keyword' | 'number' | 'string';
}

const CODE_TOKEN_PATTERN = /\/\/[^\n]*|\/\*[\s\S]*?\*\/|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\b(?:const|let|return|import|from|export|function|async|await|new|throw|if|else|for|while|true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b/g;
const COPY_RESET_DELAY = 2_000;

export function CodeBlock(props: CodeBlockProps) {
  const [copied, setCopied] = createSignal(false);
  const {language} = useLanguage();
  let resetTimer: number | undefined;

  onCleanup(() => {
    if (resetTimer !== undefined) {
      window.clearTimeout(resetTimer);
    }
  });

  function getTokens(code: string): CodeToken[] {
    const tokens: CodeToken[] = [];
    let lastIndex = 0;

    for (const match of code.matchAll(CODE_TOKEN_PATTERN)) {
      const token = match[0];
      const index = match.index ?? 0;

      if (index > lastIndex) {
        tokens.push({text: code.slice(lastIndex, index)});
      }

      tokens.push({text: token, type: getTokenType(token)});
      lastIndex = index + token.length;
    }

    if (lastIndex < code.length) {
      tokens.push({text: code.slice(lastIndex)});
    }

    return tokens;
  }

  function getTokenType(token: string): CodeToken['type'] {
    if (token.startsWith('//') || token.startsWith('/*')) {
      return 'comment';
    }

    if (token.startsWith("'") || token.startsWith('"') || token.startsWith('`')) {
      return 'string';
    }

    if (/^\d/.test(token)) {
      return 'number';
    }

    return 'keyword';
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(props.code);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = props.code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.append(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }

    setCopied(true);

    if (resetTimer !== undefined) {
      window.clearTimeout(resetTimer);
    }

    resetTimer = window.setTimeout(() => setCopied(false), COPY_RESET_DELAY);
  }

  return (
    <div class="code-block">
      <div class="code-block-toolbar">
        <span>{props.language ?? 'JavaScript'}</span>
        <button
          type="button"
          class="code-copy-button"
          onClick={copyCode}
          aria-label={copied() ? props.copiedLabel ?? (language() === 'zh' ? '已复制代码' : 'Code copied') : props.copyLabel ?? (language() === 'zh' ? '复制代码' : 'Copy code')}
          title={copied() ? props.copiedLabel ?? (language() === 'zh' ? '已复制代码' : 'Code copied') : props.copyLabel ?? (language() === 'zh' ? '复制代码' : 'Copy code')}
        >
          {copied() ? (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="9" y="9" width="11" height="11" rx="2" stroke-width="2" />
              <rect x="4" y="4" width="11" height="11" rx="2" stroke-width="2" />
            </svg>
          )}
        </button>
      </div>
      <pre>
        <code>
          {getTokens(props.code).map((token) => (
            <span class={token.type ? `code-token-${token.type}` : undefined}>{token.text}</span>
          ))}
        </code>
      </pre>
    </div>
  );
}
