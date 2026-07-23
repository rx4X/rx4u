import {createSignal, For, Show} from 'solid-js';

import {CodeBlock} from '../components/CodeBlock';
import {useLanguage, type Language} from '../components/LanguageProvider';

interface LocalizedText {
  en: string;
  zh: string;
}

interface Example {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  category: Exclude<Category, 'all'>;
  code: string;
  output: string[];
  concepts: LocalizedText[];
}

type Category = 'all' | 'basics' | 'transformation' | 'filtering' | 'async' | 'error-handling' | 'utility' | 'combination' | 'state';

const TEXT = {
  en: {
    title: 'rx4u Examples',
    description: 'Comprehensive examples showcasing rx4u\'s reactive programming capabilities. Learn by example with practical, real-world use cases.',
    viewExample: 'View Example',
    closeExample: 'Close example',
    code: 'Code',
    expectedOutput: 'Expected Output',
    keyConcepts: 'Key Concepts',
    copyCode: 'Copy code',
    codeCopied: 'Code copied',
  },
  zh: {
    title: 'rx4u 示例',
    description: '通过贴近实际场景的示例，了解 rx4u 的响应式编程能力。',
    viewExample: '查看示例',
    closeExample: '关闭示例',
    code: '代码',
    expectedOutput: '预期输出',
    keyConcepts: '核心概念',
    copyCode: '复制代码',
    codeCopied: '已复制代码',
  },
} satisfies Record<Language, Record<string, string>>;

const CATEGORY_LABELS = {
  all: {en: 'All', zh: '全部'},
  basics: {en: 'Basics', zh: '基础'},
  transformation: {en: 'Transformation', zh: '转换'},
  filtering: {en: 'Filtering', zh: '过滤'},
  async: {en: 'Async', zh: '异步'},
  'error-handling': {en: 'Error Handling', zh: '错误处理'},
  utility: {en: 'Utility', zh: '工具'},
  combination: {en: 'Combination', zh: '组合'},
  state: {en: 'State', zh: '状态'},
} satisfies Record<Category, LocalizedText>;

const examples: Example[] = [
  {
    id: 'basic-stream',
    title: {en: 'Creating and Subscribing to Streams', zh: '创建并订阅流'},
    description: {en: 'Learn the fundamentals of creating streams and subscribing to them.', zh: '了解创建流并订阅流的基础方式。'},
    category: 'basics',
    code: `import { of, interval } from 'rx4u';

// From array
const numbers$ = of(1, 2, 3, 4, 5);
numbers$(console.log); // 1, 2, 3, 4, 5

// From single values
const greeting$ = of('Hello', 'World');
greeting$(console.log); // \"Hello\", \"World\"

// From interval (every 1000ms)
const timer$ = interval(1000);
const unsubscribe = timer$(console.log); // 0, 1, 2, ...

// Clean up after 5 seconds
setTimeout(unsubscribe, 5000);`,
    output: ['1', '2', '3', '4', '5', '"Hello"', '"World"', '0', '1', '2', '3', '4'],
    concepts: [
      {en: 'Stream Creation', zh: '创建流'},
      {en: 'Subscription', zh: '订阅'},
      {en: 'Cleanup', zh: '清理'},
    ],
  },
  {
    id: 'transformation',
    title: {en: 'Transforming Data with map', zh: '使用 map 转换数据'},
    description: {en: 'Transform stream values using the map operator.', zh: '使用 map 操作符转换流中的值。'},
    category: 'transformation',
    code: `import { of, pipeFrom, map } from 'rx4u';

const numbers$ = of(1, 2, 3, 4, 5);

// Simple transformation
const doubled$ = pipeFrom(
  numbers$,
  map(x => x * 2)
);
doubled$(console.log); // 2, 4, 6, 8, 10

// Object transformation
const users$ = of(
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
);

const userNames$ = pipeFrom(
  users$,
  map(user => user.name.toUpperCase())
);
userNames$(console.log); // \"ALICE\", \"BOB\"`,
    output: ['2', '4', '6', '8', '10', '"ALICE"', '"BOB"'],
    concepts: [
      {en: 'map operator', zh: 'map 操作符'},
      {en: 'Data transformation', zh: '数据转换'},
      {en: 'Type preservation', zh: '类型保持'},
    ],
  },
  {
    id: 'filtering',
    title: {en: 'Filtering Data with Predicates', zh: '使用谓词过滤数据'},
    description: {en: 'Filter stream values based on conditions.', zh: '根据条件过滤流中的值。'},
    category: 'filtering',
    code: `import { of, pipeFrom, filter, take, skip } from 'rx4u';

const numbers$ = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// Filter even numbers
const evens$ = pipeFrom(
  numbers$,
  filter(x => x % 2 === 0)
);
evens$(console.log); // 2, 4, 6, 8, 10

// Take first 3 items
const firstThree$ = pipeFrom(
  numbers$,
  take(3)
);
firstThree$(console.log); // 1, 2, 3

// Skip first 5 items
const lastFive$ = pipeFrom(
  numbers$,
  skip(5)
);
lastFive$(console.log); // 6, 7, 8, 9, 10`,
    output: ['2', '4', '6', '8', '10', '1', '2', '3', '6', '7', '8', '9', '10'],
    concepts: [
      {en: 'filter operator', zh: 'filter 操作符'},
      {en: 'take operator', zh: 'take 操作符'},
      {en: 'skip operator', zh: 'skip 操作符'},
      {en: 'Predicate functions', zh: '谓词函数'},
    ],
  },
  {
    id: 'async-operations',
    title: {en: 'Handling Async Operations', zh: '处理异步操作'},
    description: {en: 'Work with promises and async data using switchMap.', zh: '使用 switchMap 处理 Promise 和异步数据。'},
    category: 'async',
    code: `import { of, fromPromise, pipeFrom, switchMap, map } from 'rx4u';

// Simulate API calls
const fetchUser = (id) =>
  Promise.resolve({
    id,
    name: ${'`'}User ${'$'}{id}${'`'},
    email: ${'`'}user${'$'}{id}@example.com${'`'}
  });

const userIds$ = of(1, 2, 3);

// Fetch user details
const users$ = pipeFrom(
  userIds$,
  switchMap(id => fromPromise(() => fetchUser(id))),
  map(user => ${'`'}\\${'$'}{'$'}{user.name} (\\${'$'}{'$'}{user.email})${'`'})
);

users$(
  user => console.log('User:', user),
  error => console.error('Error:', error),
  () => console.log('All users loaded!')
);`,
    output: ['User: User 1 (user1@example.com)', 'User: User 2 (user2@example.com)', 'User: User 3 (user3@example.com)', 'All users loaded!'],
    concepts: [
      {en: 'switchMap operator', zh: 'switchMap 操作符'},
      {en: 'Promise handling', zh: 'Promise 处理'},
      {en: 'Async transformation', zh: '异步转换'},
    ],
  },
  {
    id: 'error-handling',
    title: {en: 'Robust Error Handling', zh: '可靠的错误处理'},
    description: {en: 'Handle errors gracefully with catchError and retry.', zh: '使用 catchError 和 retry 优雅地处理错误。'},
    category: 'error-handling',
    code: `import { of, pipeFrom, map, catchError, retry } from 'rx4u';

// Simulate unreliable operations
const unreliableOperation$ = of(
  () => 'Success 1',
  () => { throw new Error('Network error!'); },
  () => 'Success 2'
);

// With error recovery
const resilient$ = pipeFrom(
  unreliableOperation$,
  map(fn => fn()),
  catchError(error => {
    console.log('Caught:', error.message);
    return of('Fallback value');
  })
);

resilient$(console.log);

// With retry logic
const withRetry$ = pipeFrom(
  unreliableOperation$,
  map(fn => fn()),
  retry(2), // Retry up to 2 times
  catchError(error => of('Final fallback'))
);

withRetry$(console.log);`,
    output: ['Success 1', 'Caught: Network error!', 'Fallback value', 'Success 2'],
    concepts: [
      {en: 'catchError operator', zh: 'catchError 操作符'},
      {en: 'retry operator', zh: 'retry 操作符'},
      {en: 'Error recovery', zh: '错误恢复'},
      {en: 'Fallback values', zh: '回退值'},
    ],
  },
  {
    id: 'debouncing',
    title: {en: 'Debouncing User Input', zh: '对用户输入防抖'},
    description: {en: 'Optimize user input handling with debounceTime.', zh: '使用 debounceTime 优化用户输入处理。'},
    category: 'utility',
    code: `import { of, fromPromise, pipeFrom, debounceTime, distinctUntilChanged, switchMap } from 'rx4u';

// Simulate rapid user input
const searchInput$ = of(
  'r',     // User types 'r'
  'rx',    // User types 'x'
  'rxj',   // User types 'j'
  'rxjs',  // User types 's'
  'rxjs',  // User pauses (duplicate)
  'rx4u'    // User changes to 'rx4u'
);

// Simulate search API
const search = (term) =>
  Promise.resolve(${'`'}Search results for \"\\${'$'}{'$'}{term}\"${'`'});

// Optimized search with debouncing
const searchResults$ = pipeFrom(
  searchInput$,
  debounceTime(300),              // Wait 300ms after last input
  distinctUntilChanged(),         // Skip duplicates
  switchMap(term => fromPromise(() => search(term)))
);

searchResults$(
  result => console.log(result),
  error => console.error(error)
);`,
    output: ['Search results for "rxjs"', 'Search results for "rx4u"'],
    concepts: [
      {en: 'debounceTime operator', zh: 'debounceTime 操作符'},
      {en: 'distinctUntilChanged operator', zh: 'distinctUntilChanged 操作符'},
      {en: 'Input optimization', zh: '输入优化'},
      {en: 'Search patterns', zh: '搜索模式'},
    ],
  },
  {
    id: 'combining-streams',
    title: {en: 'Combining Multiple Streams', zh: '组合多个流'},
    description: {en: 'Combine data from multiple sources using combineLatest and zip.', zh: '使用 combineLatest 和 zip 合并多个数据源。'},
    category: 'combination',
    code: `import { of, combineLatest, zip, pipeFrom, map } from 'rx4u';

// Data sources
const firstName$ = of('John', 'Jane');
const lastName$ = of('Doe', 'Smith', 'Johnson');
const age$ = of(25, 30);

// Combine latest values
const latestProfile$ = pipeFrom(
  combineLatest(firstName$, lastName$, age$),
  map(([first, last, age]) => ({
    fullName: ${'`'}\\${'$'}{first} \\${'$'}{last}${'`'},
    age
  }))
);

console.log('=== combineLatest ===');
latestProfile$(profile => console.log(profile));

// Zip corresponding values
const zippedProfile$ = pipeFrom(
  zip(firstName$, lastName$, age$),
  map(([first, last, age]) => ({
    fullName: ${'`'}\\${'$'}{first} \\${'$'}{last}${'`'},
    age
  }))
);

console.log('=== zip ===');
zippedProfile$(profile => console.log(profile));`,
    output: ['=== combineLatest ===', '{ fullName: "Jane Johnson", age: 30 }', '=== zip ===', '{ fullName: "John Doe", age: 25 }', '{ fullName: "Jane Smith", age: 30 }'],
    concepts: [
      {en: 'combineLatest operator', zh: 'combineLatest 操作符'},
      {en: 'zip operator', zh: 'zip 操作符'},
      {en: 'Stream combination', zh: '流组合'},
      {en: 'Data correlation', zh: '数据关联'},
    ],
  },
  {
    id: 'state-management',
    title: {en: 'Reactive State Management', zh: '响应式状态管理'},
    description: {en: 'Manage application state reactively with createState.', zh: '使用 createState 以响应式方式管理应用状态。'},
    category: 'state',
    code: `import { createState, pipeFrom, map, filter } from 'rx4u';

// Create reactive state
const [getCount, setCount, count$] = createState(0);

// Subscribe to state changes
count$(value => console.log('Count:', value));

// Derived state (even numbers only)
const evenCount$ = pipeFrom(
  count$,
  filter(count => count % 2 === 0),
  map(count => ${'`'}Even count: \\${'$'}{count}${'`'})
);

evenCount$(console.log);

// Update state
setCount(1);  // Count: 1
setCount(2);  // Count: 2, Even count: 2
setCount(3);  // Count: 3
setCount(4);  // Count: 4, Even count: 4

// Get current value
console.log('Current:', getCount()); // Current: 4`,
    output: ['Count: 0', 'Even count: 0', 'Count: 1', 'Count: 2', 'Even count: 2', 'Count: 3', 'Count: 4', 'Even count: 4', 'Current: 4'],
    concepts: [
      {en: 'createState function', zh: 'createState 函数'},
      {en: 'Reactive state', zh: '响应式状态'},
      {en: 'Derived state', zh: '派生状态'},
      {en: 'State management patterns', zh: '状态管理模式'},
    ],
  },
];

const categories: Category[] = ['all', 'basics', 'transformation', 'filtering', 'async', 'error-handling', 'utility', 'combination', 'state'];

export function ExamplesPage() {
  const {language} = useLanguage();
  const [selectedCategory, setSelectedCategory] = createSignal<Category>('all');
  const [selectedExample, setSelectedExample] = createSignal<string | null>(null);

  const filteredExamples = () => {
    const category = selectedCategory();
    return category === 'all' ? examples : examples.filter((example) => example.category === category);
  };

  const getSelectedExample = () => {
    const id = selectedExample();
    return id ? examples.find((ex) => ex.id === id) : null;
  };

  return (
    <div class="examples-page">
      <div class="page-container">
        {/* Header */}
        <div>
          <h1>{TEXT[language()].title}</h1>
          <p>{TEXT[language()].description}</p>
        </div>

        {/* Category Filter */}
        <div>
          <For each={categories}>
            {(category) => (
              <button
                onClick={() => setSelectedCategory(category)}
                class={`category-button ${selectedCategory() === category ? 'is-selected' : ''}`}
              >
                {CATEGORY_LABELS[category][language()]}
              </button>
            )}
          </For>
        </div>

        {/* Examples Grid */}
        <div>
          <For each={filteredExamples()}>
            {(example) => (
              <div
                class="example-card"
                onClick={() => setSelectedExample(example.id)}
              >
                <div>
                  <div>
                    <h3>{example.title[language()]}</h3>
                    <span>{CATEGORY_LABELS[example.category][language()]}</span>
                  </div>

                  <p>{example.description[language()]}</p>

                  <div>
                    <For each={example.concepts}>{(concept) => <span>{concept[language()]}</span>}</For>
                  </div>

                  <button>{TEXT[language()].viewExample} →</button>
                </div>
              </div>
            )}
          </For>
        </div>

        {/* Example Modal */}
        <Show when={getSelectedExample()}>
          {(example) => (
            <div class="example-modal-layer">
              <div class="example-modal-backdrop" onClick={() => setSelectedExample(null)} />

              <div class="example-modal-positioner" onClick={() => setSelectedExample(null)}>
                <div class="example-modal" onClick={(event) => event.stopPropagation()}>
                  {/* Header */}
                  <div>
                    <div>
                      <h2>{example().title[language()]}</h2>
                      <p>{example().description[language()]}</p>
                    </div>
                    <button
                      type="button"
                      class="example-modal-close-button"
                      onClick={() => setSelectedExample(null)}
                      aria-label={TEXT[language()].closeExample}
                      title={TEXT[language()].closeExample}
                    >
                      &times;
                    </button>
                  </div>

                  {/* Content */}
                  <div>
                    {/* Code */}
                    <div>
                      <h3>{TEXT[language()].code}</h3>
                      <CodeBlock
                        code={example().code}
                        copyLabel={TEXT[language()].copyCode}
                        copiedLabel={TEXT[language()].codeCopied}
                      />
                    </div>

                    {/* Output */}
                    <div>
                      <h3>{TEXT[language()].expectedOutput}</h3>
                      <div class="example-output-panel">
                        <For each={example().output}>{(line) => <div class="output-line">{line}</div>}</For>
                      </div>

                      {/* Concepts */}
                      <div class="example-key-concepts">
                        <h4>{TEXT[language()].keyConcepts}</h4>
                        <div class="example-concept-list">
                          <For each={example().concepts}>{(concept) => <span>{concept[language()]}</span>}</For>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Show>
      </div>
    </div>
  );
}
