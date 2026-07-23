import {createEffect, createSignal, For, onCleanup, onMount} from 'solid-js';
import {EditorView} from '@codemirror/view';
import {EditorState, StateEffect} from '@codemirror/state';
import {javascript} from '@codemirror/lang-javascript';
import {oneDark} from '@codemirror/theme-one-dark';
import {useLanguage} from '../components/LanguageProvider';
import {useTheme} from '../components/ThemeProvider';

interface LocalizedText {
  en: string;
  zh: string;
}

interface PlaygroundExample {
  name: LocalizedText;
  description: LocalizedText;
  code: string;
}

interface PlaygroundWorkerMessage {
  level?: 'error' | 'info' | 'log' | 'warn';
  runId: number;
  type: 'complete' | 'console' | 'error';
  value?: string;
}

const examples: PlaygroundExample[] = [
  {
    name: {en: 'Basic Stream', zh: '基础流'},
    description: {en: 'Create and subscribe to a simple stream', zh: '创建并订阅一个简单的流'},
    code: `import { of } from 'rx4u';

// Create a stream from an array
const numbers$ = of(1, 2, 3, 4, 5);

// Subscribe to the stream
numbers$(
  value => console.log('Value:', value),
  error => console.error('Error:', error),
  () => console.log('Completed!')
);`,
  },
  {
    name: {en: 'Transform Data', zh: '转换数据'},
    description: {en: 'Transform stream values with map and filter', zh: '使用 map 和 filter 转换流中的值'},
    code: `import { of, pipeFrom, map, filter } from 'rx4u';

const numbers$ = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

const result$ = pipeFrom(
  numbers$,
  filter(x => x % 2 === 0),  // Only even numbers
  map(x => x * 2)            // Double each number
);

result$(
  value => console.log('Transformed:', value)
); // Output: 4, 8, 12, 16, 20`,
  },
  {
    name: {en: 'Async Operations', zh: '异步操作'},
    description: {en: 'Work with promises and async data', zh: '处理 Promise 和异步数据'},
    code: `import { of, fromPromise, pipeFrom, switchMap } from 'rx4u';

// Simulate API calls
const fetchUser = (id) =>
  Promise.resolve({ id, name: \`User \${id}\` });

const userIds$ = of(1, 2, 3);

const users$ = pipeFrom(
  userIds$,
  switchMap(id => fromPromise(() => fetchUser(id)))
);

users$(
  user => console.log('User:', user),
  error => console.error('Error:', error),
  () => console.log('All users loaded!')
);`,
  },
  {
    name: {en: 'Error Handling', zh: '错误处理'},
    description: {en: 'Handle errors gracefully with catchError', zh: '使用 catchError 优雅处理错误'},
    code: `import { of, pipeFrom, map, catchError } from 'rx4u';

const riskyOperation$ = of(
  () => 'success',
  () => { throw new Error('Something went wrong!'); },
  () => 'another success'
);

const safe$ = pipeFrom(
  riskyOperation$,
  map(fn => fn()),
  catchError(error => {
    console.log('Caught error:', error.message);
    return of('fallback value');
  })
);

safe$(
  value => console.log('Result:', value)
);`,
  },
  {
    name: {en: 'Debounce Input', zh: '输入防抖'},
    description: {en: 'Debounce user input for search functionality', zh: '为搜索功能中的用户输入防抖'},
    code: `import { of, fromPromise, pipeFrom, debounceTime, distinctUntilChanged, switchMap } from 'rx4u';

// Simulate search input events
const searchTerms$ = of(
  'r', 'rx', 'rxj', 'rxjs', 'rxjs', 'rx4u'
);

// Simulate search function
const search = (term) =>
  Promise.resolve(\`Results for "\${term}"\`);

const searchResults$ = pipeFrom(
  searchTerms$,
  debounceTime(300),              // Wait 300ms after last input
  distinctUntilChanged(),         // Only if different from previous
  switchMap(term => fromPromise(() => search(term)))
);

searchResults$(
  result => console.log(result)
);`,
  },
  {
    name: {en: 'Combine Streams', zh: '组合流'},
    description: {en: 'Combine multiple streams with combineLatest', zh: '使用 combineLatest 组合多个流'},
    code: `import { of, combineLatest, pipeFrom, map } from 'rx4u';

const firstName$ = of('John', 'Jane');
const lastName$ = of('Doe', 'Smith');
const age$ = of(25, 30);

const profile$ = pipeFrom(
  combineLatest(firstName$, lastName$, age$),
  map(([first, last, age]) => ({
    fullName: \`\${first} \${last}\`,
    age: age
  }))
);

profile$(
  person => console.log('Profile:', person)
);`,
  },
];

export function PlaygroundPage() {
  const {language} = useLanguage();
  const {theme} = useTheme();
  const [currentCode, setCurrentCode] = createSignal(examples[0].code);
  const [output, setOutput] = createSignal<string[]>([]);
  const [isRunning, setIsRunning] = createSignal(false);
  const [selectedExample, setSelectedExample] = createSignal(0);
  let editorRef: HTMLDivElement | undefined;
  let editorView: EditorView | undefined;
  let currentRunId = 0;
  let runner: Worker | undefined;

  onMount(() => {
    initializeEditor();
  });

  onCleanup(() => {
    runner?.terminate();
    editorView?.destroy();
  });

  createEffect(() => {
    if (editorView) {
      // Update theme when theme changes
      const currentTheme = theme();
      const extensions = [EditorView.lineWrapping, javascript(), ...(currentTheme === 'dark' ? [oneDark] : [])];

      editorView.dispatch({
        effects: StateEffect.reconfigure.of(extensions),
      });
    }
  });

  const initializeEditor = () => {
    if (!editorRef) {
      return;
    }

    const startState = EditorState.create({
      doc: currentCode(),
      extensions: [
        EditorView.lineWrapping,
        javascript(),
        ...(theme() === 'dark' ? [oneDark] : []),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setCurrentCode(update.state.doc.toString());
          }
        }),
      ],
    });

    editorView = new EditorView({
      state: startState,
      parent: editorRef,
    });
  };

  const selectExample = (index: number) => {
    setSelectedExample(index);
    const example = examples[index];
    setCurrentCode(example.code);

    if (editorView) {
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: example.code,
        },
      });
    }
  };

  const handleRunnerMessage = (event: MessageEvent<PlaygroundWorkerMessage>) => {
    const message = event.data;

    if (message.runId !== currentRunId) {
      return;
    }

    if (message.type === 'complete') {
      setIsRunning(false);
      return;
    }

    if (message.type === 'error') {
      setOutput((lines) => [...lines, `[ERROR] ${message.value}`]);
      setIsRunning(false);
      return;
    }

    const prefix = message.level === 'error' ? '[ERROR]' : message.level === 'warn' ? '[WARN]' : message.level === 'info' ? '[INFO]' : '[LOG]';
    setOutput((lines) => [...lines, `${prefix} ${message.value}`]);
  };

  const handleRunnerError = (event: ErrorEvent) => {
    setOutput((lines) => [...lines, `[ERROR] ${event.message}`]);
    setIsRunning(false);
  };

  const runCode = () => {
    const code = editorView ? editorView.state.doc.toString() : currentCode();

    setIsRunning(true);
    setOutput([]);
    setCurrentCode(code);

    runner?.terminate();
    currentRunId++;
    runner = new Worker(new URL('../workers/playground-worker.ts', import.meta.url), {type: 'module'});
    runner.addEventListener('error', handleRunnerError);
    runner.addEventListener('message', handleRunnerMessage);
    runner.postMessage({code, runId: currentRunId});
  };

  const clearOutput = () => {
    setOutput([]);
  };

  return (
    <div class="playground-page">
      <div class="page-container">
        {/* Header */}
        <div class="playground-examples">
          <h1>rx4u {language() === 'zh' ? '练习场' : 'Playground'}</h1>
          <p>{language() === 'zh' ? '在浏览器中体验 rx4u 响应式编程。尝试示例或编写自己的代码。' : 'Experiment with rx4u reactive programming in your browser. Try the examples or write your own code.'}</p>
        </div>

        {/* Examples */}
        <div>
          <h2>{language() === 'zh' ? '示例' : 'Examples'}</h2>
          <div>
            <For each={examples}>
              {(example, index) => (
                <button
                  onClick={() => selectExample(index())}
                  class={`playground-example-button ${selectedExample() === index() ? 'is-selected' : ''}`}
                >
                  <h3>{example.name[language()]}</h3>
                  <p>{example.description[language()]}</p>
                </button>
              )}
            </For>
          </div>
        </div>

        {/* Editor and Output */}
        <div>
          {/* Code Editor */}
          <div>
            <div>
              <h3>{language() === 'zh' ? '代码编辑器' : 'Code Editor'}</h3>
              <div>
                <button
                  onClick={runCode}
                  disabled={isRunning()}
                  class={`run-code-button ${isRunning() ? 'is-running' : ''}`}
                >
                  {isRunning() ? (language() === 'zh' ? '运行中...' : 'Running...') : language() === 'zh' ? '运行代码' : 'Run Code'}
                </button>
              </div>
            </div>
            <div ref={editorRef!} />
          </div>

          {/* Output */}
          <div>
            <div>
              <h3>{language() === 'zh' ? '输出' : 'Output'}</h3>
              <button
                type="button"
                class="output-clear-button"
                onClick={clearOutput}
                disabled={output().length === 0}
                aria-label={language() === 'zh' ? '清空输出' : 'Clear output'}
                title={language() === 'zh' ? '清空输出' : 'Clear output'}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16m-10 4v6m4-6v6M9 7l1-3h4l1 3m-9 0l1 13h10l1-13" />
                </svg>
              </button>
            </div>
            <div>
              {output().length === 0 ? (
                <div>{language() === 'zh' ? '点击“运行代码”在这里查看输出...' : 'Click "Run Code" to see output here...'}</div>
              ) : (
                <For each={output()}>
                  {(line) => (
                    <div
                      class={`output-line ${line.startsWith('[ERROR]') ? 'is-error' : line.startsWith('[INFO]') ? 'is-info' : ''}`}
                    >
                      {line}
                    </div>
                  )}
                </For>
              )}
            </div>
          </div>
        </div>

        {/* Info Notice */}
        <div class="playground-notice">
          <div>
            <div class="playground-notice-icon">
              <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="playground-notice-content">
              <h4>{language() === 'zh' ? '练习场说明' : 'Playground Notice'}</h4>
              <p>
                {language() === 'zh'
                  ? <><code>rx4u</code> 导入可在隔离 Worker 中运行；不支持从其他包导入。</>
                  : <>The editor runs code in an isolated Worker. Imports from <code>rx4u</code> are available, while imports from other packages are not supported.</>}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
