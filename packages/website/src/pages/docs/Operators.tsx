import {A} from '@solidjs/router';
import {createSignal, For, Show} from 'solid-js';

import {CodeBlock} from '../../components/CodeBlock';
import {useLanguage} from '../../components/LanguageProvider';

interface OperatorInfo {
  name: string;
  signature: string;
  description: string;
  category: string;
  example?: string;
  parameters?: {name: string; type: string; description: string}[];
}

const CATEGORY_LABELS: Record<string, string> = {
  creation: '创建',
  transformation: '转换',
  filtering: '过滤',
  combination: '组合',
  utility: '工具',
  'error-handling': '错误处理',
  mathematical: '数学',
};

const OPERATOR_DESCRIPTIONS_ZH: Record<string, string> = {
  from: '从同步工厂函数创建流。',
  fromPromise: '从 Promise 工厂函数创建流。',
  of: '创建按顺序发出给定值的流。',
  interval: '创建按指定间隔发出连续数字的流。',
  map: '使用投射函数转换每个发出的值。',
  switchMap: '将每个值投射为新流，并切换到最新投射。',
  mergeMap: '将每个值投射为流，并合并所有并发流。',
  concatMap: '将每个值投射为流，并按顺序连接。',
  filter: '只发出满足给定谓词函数的值。',
  take: '只发出源流的前 N 个值。',
  skip: '跳过源流的前 N 个值。',
  distinctUntilChanged: '仅在当前值不同于前一个值时发出。',
  merge: '将多个流合并为单个流。',
  combineLatest: '任意源流发出值时组合所有流的最新值。',
  zip: '按位置组合多个流中的值。',
  tap: '为源流通知执行副作用。',
  debounceTime: '在指定静默期后才发出值。',
  throttleTime: '在每个时间段内最多发出一个值。',
  share: '在订阅者之间共享一次源流订阅。',
  startWith: '在源流值之前发出指定值。',
  endWith: '在源流完成后发出指定值。',
  catchError: '捕获错误并使用回退流继续执行。',
  retry: '源流发生错误时重试。',
  retryWhen: '根据自定义重试逻辑重试。',
  scan: '应用累加器函数并发出每个中间结果。',
  reduce: '应用累加器函数，并在源流完成时发出最终结果。',
};

const operators: OperatorInfo[] = [
  // Creation Functions
  {
    name: 'from',
    signature: 'from<T>(create: () => T): Sub<T>',
    description: 'Creates a stream from a synchronous factory function.',
    category: 'creation',
    example: `const lazy$ = from(() => Math.random());
const greeting$ = from(() => 'hello');`,
  },
  {
    name: 'fromPromise',
    signature: 'fromPromise<T>(create: () => Promise<T>): Sub<T>',
    description: 'Creates a stream from a Promise factory.',
    category: 'creation',
    example: `const request$ = fromPromise(() => fetch('/api/data'));
request$(console.log);`,
  },
  {
    name: 'of',
    signature: 'of<T>(...values: T[]): Sub<T>',
    description: 'Creates a stream that emits the provided values in sequence.',
    category: 'creation',
    example: `const stream$ = of(1, 2, 3);
stream$(console.log); // Emits: 1, 2, 3`,
  },
  {
    name: 'interval',
    signature: 'interval(period: number): Sub<number>',
    description: 'Creates a stream that emits sequential numbers at specified intervals.',
    category: 'creation',
    example: `const timer$ = interval(1000);
timer$(console.log); // Emits: 0, 1, 2, ... every second`,
  },

  // Transformation Operators
  {
    name: 'map',
    signature: 'map<T, R>(mapFn: (value: T) => R): Operator<T, R>',
    description: 'Transforms each emitted value using a projection function.',
    category: 'transformation',
    example: `const doubled$ = pipeFrom(
  of(1, 2, 3),
  map(x => x * 2)
); // Emits: 2, 4, 6`,
  },
  {
    name: 'switchMap',
    signature: 'switchMap<T, R>(project: (value: T, index: number) => Sub<R> | Promise<R>): Operator<T, R>',
    description: 'Projects each value to a new stream and switches to the latest projection.',
    category: 'transformation',
    example: `const searchResults$ = pipeFrom(
  searchQuery$,
  debounceTime(300),
  switchMap(query => fromPromise(() => fetch(\`/search?q=\${query}\`)))
);`,
  },
  {
    name: 'mergeMap',
    signature: 'mergeMap<T, R>(project: (value: T, index: number) => Sub<R>, concurrent?: number): Operator<T, R>',
    description: 'Projects each value to a stream and merges all concurrent streams.',
    category: 'transformation',
    example: `const allRequests$ = pipeFrom(
  urls$,
  mergeMap(url => fromPromise(() => fetch(url)))
);`,
  },
  {
    name: 'concatMap',
    signature: 'concatMap<T, R>(project: (value: T, index: number) => Sub<R>): Operator<T, R>',
    description: 'Projects each value to a stream and concatenates them sequentially.',
    category: 'transformation',
    example: `const sequential$ = pipeFrom(
  of(1, 2, 3),
  concatMap(x => of(x, x * 2))
); // Emits: 1, 2, 2, 4, 3, 6`,
  },

  // Filtering Operators
  {
    name: 'filter',
    signature: 'filter<T>(predicate: (value: T) => boolean): Operator<T, T>',
    description: 'Emits only values that satisfy the provided predicate function.',
    category: 'filtering',
    example: `const evens$ = pipeFrom(
  of(1, 2, 3, 4, 5),
  filter(x => x % 2 === 0)
); // Emits: 2, 4`,
  },
  {
    name: 'take',
    signature: 'take<T>(count: number): Operator<T, T>',
    description: 'Emits only the first N values from the source.',
    category: 'filtering',
    example: `const first3$ = pipeFrom(
  interval(1000),
  take(3)
); // Emits: 0, 1, 2, then completes`,
  },
  {
    name: 'skip',
    signature: 'skip<T>(count: number): Operator<T, T>',
    description: 'Skips the first N values from the source.',
    category: 'filtering',
    example: `const skipFirst2$ = pipeFrom(
  of(1, 2, 3, 4, 5),
  skip(2)
); // Emits: 3, 4, 5`,
  },
  {
    name: 'distinctUntilChanged',
    signature: 'distinctUntilChanged<T, K = T>(compareFn?: (a: K, b: K) => boolean, keySelector?: (value: T) => K): Operator<T, T>',
    description: 'Only emits when the current value differs from the previous.',
    category: 'filtering',
    example: `const unique$ = pipeFrom(
  of(1, 1, 2, 2, 3),
  distinctUntilChanged()
); // Emits: 1, 2, 3`,
  },

  // Combination Operators
  {
    name: 'merge',
    signature: 'merge<T>(...sources: Sub<T>[]): Sub<T>',
    description: 'Merges multiple streams into a single stream.',
    category: 'combination',
    example: `const combined$ = merge(
  of(1, 2, 3),
  of(4, 5, 6)
); // Emits: 1, 2, 3, 4, 5, 6`,
  },
  {
    name: 'combineLatest',
    signature: 'combineLatest<T extends readonly unknown[]>(...sources: {[K in keyof T]: Sub<T[K]>}): Sub<T>',
    description: 'Combines latest values from multiple streams whenever any stream emits.',
    category: 'combination',
    example: `const latest$ = combineLatest(
  of(1, 2),
  of('a', 'b')
); // Emits: [2, 'a'], [2, 'b']`,
  },
  {
    name: 'zip',
    signature: 'zip<T extends readonly unknown[]>(...sources: {[K in keyof T]: Sub<T[K]>}): Sub<T>',
    description: 'Combines values from multiple streams pairwise.',
    category: 'combination',
    example: `const paired$ = zip(
  of(1, 2),
  of('a', 'b')
); // Emits: [1, 'a'], [2, 'b']`,
  },

  // Utility Operators
  {
    name: 'tap',
    signature: 'tap<T>(tapFn: (value: T) => void): Operator<T, T>',
    description: 'Performs side effects for notifications from the source stream.',
    category: 'utility',
    example: `const logged$ = pipeFrom(
  of(1, 2, 3),
  tap(x => console.log('Value:', x))
);`,
  },
  {
    name: 'debounceTime',
    signature: 'debounceTime<T>(dueTime: number): Operator<T, T>',
    description: 'Emits a value only after a specified silence period.',
    category: 'utility',
    example: `const debounced$ = pipeFrom(
  searchInput$,
  debounceTime(300)
); // Wait 300ms after last input`,
  },
  {
    name: 'throttleTime',
    signature: 'throttleTime<T>(duration: number, options?: {leading?: boolean; trailing?: boolean}): Operator<T, T>',
    description: 'Emits at most one value per time period.',
    category: 'utility',
    example: `const throttled$ = pipeFrom(
  clicks$,
  throttleTime(1000)
); // Max 1 click per second`,
  },
  {
    name: 'share',
    signature: 'share<T>(): Operator<T, T>',
    description: 'Shares a single subscription among multiple subscribers.',
    category: 'utility',
    example: `const shared$ = pipeFrom(
  expensiveOperation$,
  share()
); // Multiple subscribers share the same execution`,
  },
  {
    name: 'startWith',
    signature: 'startWith<T>(...values: T[]): Operator<T, T>',
    description: 'Emits specified values before the source stream values.',
    category: 'utility',
    example: `const withDefault$ = pipeFrom(
  of(2, 3),
  startWith(1)
); // Emits: 1, 2, 3`,
  },
  {
    name: 'endWith',
    signature: 'endWith<T>(...values: T[]): Operator<T, T>',
    description: 'Emits specified values after the source stream completes.',
    category: 'utility',
    example: `const withEnd$ = pipeFrom(
  of(1, 2),
  endWith(3)
); // Emits: 1, 2, 3`,
  },

  // Error Handling Operators
  {
    name: 'catchError',
    signature: 'catchError<T, R = T>(selector: (error: unknown, caught: Sub<T>) => Sub<R>): Operator<T, T | R>',
    description: 'Catches errors and continues with a fallback stream.',
    category: 'error-handling',
    example: `const resilient$ = pipeFrom(
  riskyOperation$,
  catchError(err => of('fallback'))
);`,
  },
  {
    name: 'retry',
    signature: 'retry<T>(count?: number): Operator<T, T>',
    description: 'Retries the source stream on error.',
    category: 'error-handling',
    example: `const retried$ = pipeFrom(
  unreliableRequest$,
  retry(3)
); // Retry up to 3 times`,
  },
  {
    name: 'retryWhen',
    signature: 'retryWhen<T>(notifier: (errors: Sub<unknown>) => Sub<unknown>): Operator<T, T>',
    description: 'Retries based on custom retry logic.',
    category: 'error-handling',
    example: `const smartRetry$ = pipeFrom(
  source$,
  retryWhen(errors => pipeFrom(
    errors,
    debounceTime(1000),
    take(3)
  ))
);`,
  },

  // Mathematical Operators
  {
    name: 'scan',
    signature: 'scan<T, R = T>(accumulator: (acc: R, value: T, index: number) => R, seed?: R): Operator<T, R>',
    description: 'Applies an accumulator function and emits each intermediate result.',
    category: 'mathematical',
    example: `const running$ = pipeFrom(
  of(1, 2, 3, 4),
  scan((acc, x) => acc + x, 0)
); // Emits: 1, 3, 6, 10`,
  },
  {
    name: 'reduce',
    signature: 'reduce<T, R = T>(accumulator: (acc: R, value: T, index: number) => R, seed?: R): Operator<T, R>',
    description: 'Applies an accumulator function and emits the final result when the source completes.',
    category: 'mathematical',
    example: `const sum$ = pipeFrom(
  of(1, 2, 3, 4),
  reduce((acc, x) => acc + x, 0)
); // Emits: 10`,
  },
];

const categories = [
  {id: 'creation', name: 'Creation', description: 'Functions that create streams'},
  {id: 'transformation', name: 'Transformation', description: 'Transform values or streams'},
  {id: 'filtering', name: 'Filtering', description: 'Filter and select values'},
  {id: 'combination', name: 'Combination', description: 'Combine multiple streams'},
  {id: 'utility', name: 'Utility', description: 'Utility and helper operators'},
  {id: 'error-handling', name: 'Error Handling', description: 'Handle errors and failures'},
  {id: 'mathematical', name: 'Mathematical', description: 'Mathematical operations'},
];

export function Operators() {
  const {language} = useLanguage();
  const [selectedCategory, setSelectedCategory] = createSignal('creation');
  const [searchTerm, setSearchTerm] = createSignal('');

  const filteredOperators = () => {
    const category = selectedCategory();
    const search = searchTerm().toLowerCase();

    return operators.filter((op) => {
      const matchesCategory = category === 'all' || op.category === category;
      const description = language() === 'zh' ? OPERATOR_DESCRIPTIONS_ZH[op.name] : op.description;
      const matchesSearch = search === '' || op.name.toLowerCase().includes(search) || description.toLowerCase().includes(search);
      return matchesCategory && matchesSearch;
    });
  };

  return (
    <article class="documentation-page operators-page">
      <h1>{language() === 'zh' ? '操作符参考' : 'Operators Reference'}</h1>

      <p>
        {language() === 'zh' ? (
          <>
            本页汇总了用于创建、转换、过滤和组合流的常用函数。可使用 <code>pipeFrom</code> 函数组合操作符。
          </>
        ) : (
          <>
            This page summarizes commonly used functions for creating, transforming, filtering, and combining streams. Operators can be composed using the <code>pipeFrom</code> function.
          </>
        )}
      </p>

      {/* Search */}
      <div class="operator-search">
        <div>
          <input type="text" placeholder={language() === 'zh' ? '搜索操作符...' : 'Search operators...'} value={searchTerm()} onInput={(e) => setSearchTerm(e.currentTarget.value)} />
        </div>
      </div>

      {/* Category Tabs */}
      <div class="operator-category-tabs">
        <div>
          <For each={categories}>
            {(category) => (
              <button onClick={() => setSelectedCategory(category.id)} class={`category-button ${selectedCategory() === category.id ? 'is-selected' : ''}`}>
                {language() === 'zh' ? CATEGORY_LABELS[category.id] : category.name}
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Category Description */}
      <Show when={selectedCategory() !== 'all'}>
        <div>
          <div class="operator-category-overview">
            <h3>{language() === 'zh' ? `${CATEGORY_LABELS[selectedCategory()]}操作符` : `${categories.find((c) => c.id === selectedCategory())?.name} Operators`}</h3>
            <p>{language() === 'zh' ? `用于${CATEGORY_LABELS[selectedCategory()]}相关处理的操作符。` : categories.find((c) => c.id === selectedCategory())?.description}</p>
          </div>
        </div>
      </Show>

      {/* Operators List */}
      <div class="operator-list">
        <For each={filteredOperators()}>
          {(operator) => (
            <div class="operator-card">
              <div>
                <h3>{operator.name}</h3>
                <div>{operator.signature}</div>
              </div>

              <p>{language() === 'zh' ? OPERATOR_DESCRIPTIONS_ZH[operator.name] : operator.description}</p>

              <Show when={operator.example}>
                <div>
                  <h4>{language() === 'zh' ? '示例：' : 'Example:'}</h4>
                  <CodeBlock code={operator.example!} />
                </div>
              </Show>

              <div>
                <span>{language() === 'zh' ? CATEGORY_LABELS[operator.category] : operator.category}</span>
              </div>
            </div>
          )}
        </For>
      </div>

      <Show when={filteredOperators().length === 0}>
        <div>
          <p>{language() === 'zh' ? '未找到符合搜索条件的操作符。' : 'No operators found matching your search.'}</p>
        </div>
      </Show>

      <h2>{language() === 'zh' ? '使用模式' : 'Usage Patterns'}</h2>

      <h3>{language() === 'zh' ? '基础组合' : 'Basic Composition'}</h3>

      <p>
        {language() === 'zh' ? (
          <>
            所有操作符都可以与 <code>pipeFrom</code> 函数配合使用：
          </>
        ) : (
          <>
            All operators are designed to work with the <code>pipeFrom</code> function:
          </>
        )}
      </p>

      <div>
        <div>
          <CodeBlock
            language="TypeScript"
            code={`import { pipeFrom, from, map, filter, take } from 'rx4u';

const result$ = pipeFrom(
  of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10),
  filter(x => x % 2 === 0),  // Keep even numbers
  map(x => x * x),           // Square them
  take(3)                    // Take first 3
); // Emits: 4, 16, 36`}
          />
        </div>
      </div>

      <h3>{language() === 'zh' ? '错误处理模式' : 'Error Handling Pattern'}</h3>

      <div>
        <div>
          <CodeBlock
            code={`const resilientStream$ = pipeFrom(
  riskyOperation$,
  retry(3),
  catchError(error => {
    console.error('Operation failed:', error);
    return of('fallback value');
  })
);`}
          />
        </div>
      </div>

      <h3>{language() === 'zh' ? '异步操作' : 'Async Operations'}</h3>

      <div>
        <div>
          <CodeBlock
            code={`const searchResults$ = pipeFrom(
  searchInput$,
  debounceTime(300),         // Wait for user to stop typing
  distinctUntilChanged(),    // Skip duplicate queries
  switchMap(query =>         // Switch to new search
    fromPromise(() => fetch(\`/api/search?q=\${query}\`))
  ),
  catchError(err => of([))  // Return empty on error
);`}
          />
        </div>
      </div>

      <h2>{language() === 'zh' ? '下一步' : 'Next Steps'}</h2>

      <div class="operator-next-steps">
        <div>
          <A href="/docs/core-concepts">
            <h3>{language() === 'zh' ? '核心概念' : 'Core Concepts'}</h3>
            <p>{language() === 'zh' ? '了解基础概念' : 'Learn the fundamental concepts'}</p>
          </A>

          <A href="/examples">
            <h3>{language() === 'zh' ? '示例' : 'Examples'}</h3>
            <p>{language() === 'zh' ? '查看操作符实际运行' : 'See operators in action'}</p>
          </A>

          <A href="/playground">
            <h3>{language() === 'zh' ? '练习场' : 'Playground'}</h3>
            <p>{language() === 'zh' ? '浏览可编辑的 rx4u 示例' : 'Browse editable rx4u examples'}</p>
          </A>

          <A href="/api-reference">
            <h3>{language() === 'zh' ? 'API 参考' : 'API Reference'}</h3>
            <p>{language() === 'zh' ? '完整 API 文档' : 'Complete API documentation'}</p>
          </A>
        </div>
      </div>
    </article>
  );
}
