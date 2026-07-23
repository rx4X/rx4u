import {createSignal, For, Show} from 'solid-js';
import {useParams} from '@solidjs/router';

import {CodeBlock} from '../components/CodeBlock';
import {useLanguage} from '../components/LanguageProvider';

interface OperatorInfo {
  name: string;
  signature: string;
  description: string;
  category: string;
  example?: string;
  parameters?: {name: string; type: string; description: string}[];
}

const CATEGORY_LABELS: Record<string, string> = {
  all: '全部',
  core: '核心',
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
  fromEvent: '从类似 DOM 的事件目标创建事件流。',
  createState: '使用初始值创建响应式状态。',
  createLazyState: '创建首次更新前不会发出值的响应式状态。',
  createSubject: '创建多播流和用于广播值的函数。',
  pipeFrom: '从左到右将操作符应用到源流。',
  firstValueFrom: '解析第一个值；当流报错或空完成时拒绝。',
  map: '使用投射函数转换每个发出的值。',
  switchMap: '将每个值投射为新流，并切换到最新投射。',
  mergeMap: '将每个值投射为流，并合并所有并发流。',
  concatMap: '将每个值投射为流，并按顺序连接。',
  filter: '只发出满足给定谓词函数的值。',
  take: '只发出源流的前 N 个值。',
  takeWhile: '谓词通过时持续发出值，随后完成。',
  takeUntil: '在通知流发出值前持续发出源流的值。',
  skip: '跳过源流的前 N 个值。',
  distinctUntilChanged: '仅在当前值不同于前一个值时发出。',
  merge: '将多个流合并为单个流。',
  combineLatest: '任意源流发出值时组合所有流的最新值。',
  zip: '按位置组合多个流中的值。',
  withLatestFrom: '将源流的值与其他流的最新值组合。',
  tap: '为源流通知执行副作用。',
  delay: '将每个通知延迟指定的时间。',
  debounceTime: '在指定静默期后才发出值。',
  throttleTime: '在每个时间段内最多发出一个值。',
  timeout: '当源流在给定时间内未发出值时失败。',
  startWith: '在源流值之前发出指定值。',
  endWith: '在源流完成后发出指定值。',
  share: '在订阅者之间共享一次源流订阅。',
  catchError: '捕获错误并使用回退流继续执行。',
  retry: '源流发生错误时重试。',
  retryWhen: '根据自定义重试逻辑重试。',
  scan: '应用累加器函数并发出每个中间结果。',
  reduce: '应用累加器函数，并在源流完成时发出最终结果。',
};

const PARAMETER_DESCRIPTIONS_ZH: Record<string, string> = {
  'Factory function that returns the value to emit': '返回要发出值的工厂函数',
  'Factory function that returns a Promise': '返回 Promise 的工厂函数',
  'Values to emit': '要发出的值',
  'Time interval in milliseconds': '以毫秒为单位的时间间隔',
  'Object that provides addEventListener and removeEventListener': '提供 addEventListener 和 removeEventListener 的对象',
  'Event type to listen for': '要监听的事件类型',
  'Optional event listener options': '可选的事件监听器选项',
  'Initial state value': '初始状态值',
  'Source stream': '源流',
  'Operators to apply in order': '按顺序应用的操作符',
  'Function to transform each value': '转换每个值的函数',
  'Function that projects each value to a stream or Promise': '将每个值投射为流或 Promise 的函数',
  'Function that projects each value to a stream': '将每个值投射为流的函数',
  'Optional maximum number of active inner streams': '可选的最大活跃内部流数量',
  'Function to test each value': '测试每个值的函数',
  'Function that tests each value': '测试每个值的函数',
  'Whether to emit the first value that fails the predicate': '是否发出第一个未通过谓词的值',
  'Stream whose first value stops the source': '其第一个值会停止源流的流',
  'Number of values to take': '要获取的值数量',
  'Number of values to skip': '要跳过的值数量',
  'Optional comparison function': '可选的比较函数',
  'Optional function that selects the compared key': '选择比较键的可选函数',
  'Streams to merge': '要合并的流',
  'Streams to combine': '要组合的流',
  'Streams to zip': '要按位置配对的流',
  'Streams that provide the latest accompanying values': '提供最新伴随值的流',
  'Function called for each value': '为每个值调用的函数',
  'Delay in milliseconds': '以毫秒为单位的延迟',
  'Time in milliseconds to wait': '等待时间（毫秒）',
  'Time period in milliseconds': '时间周期（毫秒）',
  'Optional leading and trailing emission behavior': '可选的前沿和后沿发出行为',
  'Timeout duration in milliseconds': '超时长度（毫秒）',
  'Optional custom error factory': '可选的自定义错误工厂函数',
  'Values to prepend': '要前置发出的值',
  'Values to append': '要追加发出的值',
  'Function to handle errors': '处理错误的函数',
  'Number of retry attempts': '重试次数',
  'Function that controls retry timing': '控制重试时机的函数',
  'Accumulator function': '累加器函数',
  'Optional initial accumulator value': '可选的初始累加器值',
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
    parameters: [{name: 'create', type: '() => T', description: 'Factory function that returns the value to emit'}],
  },
  {
    name: 'fromPromise',
    signature: 'fromPromise<T>(create: () => Promise<T>): Sub<T>',
    description: 'Creates a stream from a Promise factory.',
    category: 'creation',
    example: `const request$ = fromPromise(() => fetch('/api/data'));
request$(console.log);`,
    parameters: [{name: 'create', type: '() => Promise<T>', description: 'Factory function that returns a Promise'}],
  },
  {
    name: 'of',
    signature: 'of<T>(...values: T[]): Sub<T>',
    description: 'Creates a stream that emits the provided values in sequence.',
    category: 'creation',
    example: `const stream$ = of(1, 2, 3);
stream$(console.log); // Emits: 1, 2, 3`,
    parameters: [{name: 'values', type: 'T[]', description: 'Values to emit'}],
  },
  {
    name: 'interval',
    signature: 'interval(period: number): Sub<number>',
    description: 'Creates a stream that emits sequential numbers at specified intervals.',
    category: 'creation',
    example: `const timer$ = interval(1000);
timer$(console.log); // Emits: 0, 1, 2, ... every second`,
    parameters: [{name: 'period', type: 'number', description: 'Time interval in milliseconds'}],
  },
  {
    name: 'fromEvent',
    signature: 'fromEvent<T extends Event = Event>(target: EventTargetLike, type: string, options?): Sub<T>',
    description: 'Creates a stream from events on a DOM-like event target.',
    category: 'creation',
    example: `const clicks$ = fromEvent<MouseEvent>(button, 'click');
clicks$(event => console.log(event.clientX));`,
    parameters: [
      {name: 'target', type: 'EventTargetLike', description: 'Object that provides addEventListener and removeEventListener'},
      {name: 'type', type: 'string', description: 'Event type to listen for'},
      {name: 'options', type: 'AddEventListenerOptions | EventListenerOptions | boolean', description: 'Optional event listener options'},
    ],
  },
  {
    name: 'createState',
    signature: 'createState<T>(initialValue: T): [Sub<T>, StateSetter<T>, () => T, () => void]',
    description: 'Creates reactive state with an initial value.',
    category: 'creation',
    example: `const [count$, setCount, getCount, destroy] = createState(0);
count$(console.log);
setCount(value => value + 1);`,
    parameters: [{name: 'initialValue', type: 'T', description: 'Initial state value'}],
  },
  {
    name: 'createLazyState',
    signature: 'createLazyState<T>(): [Sub<T>, StateSetter<T>, () => T | undefined, () => void]',
    description: 'Creates reactive state that does not emit until its first update.',
    category: 'creation',
    example: `const [name$, setName] = createLazyState<string>();
name$(console.log);
setName('Ada');`,
    parameters: [],
  },
  {
    name: 'createSubject',
    signature: 'createSubject<T>(): [Sub<T>, (value: T) => void]',
    description: 'Creates a multicast stream and a function that broadcasts values.',
    category: 'creation',
    example: `const [messages$, nextMessage] = createSubject<string>();
messages$(console.log);
nextMessage('hello');`,
    parameters: [],
  },

  // Core Helpers
  {
    name: 'pipeFrom',
    signature: 'pipeFrom<T>(source: Sub<T>, ...operators: Operator[]): Sub<unknown>',
    description: 'Applies operators to a source stream from left to right.',
    category: 'core',
    example: `const doubled$ = pipeFrom(
  of(1, 2, 3),
  map(value => value * 2)
);`,
    parameters: [
      {name: 'source', type: 'Sub<T>', description: 'Source stream'},
      {name: 'operators', type: 'Operator[]', description: 'Operators to apply in order'},
    ],
  },
  {
    name: 'firstValueFrom',
    signature: 'firstValueFrom<T>(source: Sub<T>): Promise<T>',
    description: 'Resolves with the first value, or rejects if the stream errors or completes empty.',
    category: 'core',
    example: `const first = await firstValueFrom(of(1, 2, 3));`,
    parameters: [{name: 'source', type: 'Sub<T>', description: 'Source stream'}],
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
    parameters: [{name: 'mapFn', type: '(value: T) => R', description: 'Function to transform each value'}],
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
    parameters: [{name: 'project', type: '(value: T, index: number) => Sub<R> | Promise<R>', description: 'Function that projects each value to a stream or Promise'}],
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
    parameters: [
      {name: 'project', type: '(value: T, index: number) => Sub<R>', description: 'Function that projects each value to a stream'},
      {name: 'concurrent', type: 'number', description: 'Optional maximum number of active inner streams'},
    ],
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
    parameters: [{name: 'project', type: '(value: T, index: number) => Sub<R>', description: 'Function that projects each value to a stream'}],
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
    parameters: [{name: 'predicate', type: '(value: T) => boolean', description: 'Function to test each value'}],
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
    parameters: [{name: 'count', type: 'number', description: 'Number of values to take'}],
  },
  {
    name: 'takeWhile',
    signature: 'takeWhile<T>(predicate: (value: T, index: number) => boolean, inclusive?: boolean): Operator<T, T>',
    description: 'Emits values while the predicate passes, then completes.',
    category: 'filtering',
    example: `const values$ = pipeFrom(
  of(1, 2, 3, 4),
  takeWhile(value => value < 3, true)
); // Emits: 1, 2, 3`,
    parameters: [
      {name: 'predicate', type: '(value: T, index: number) => boolean', description: 'Function that tests each value'},
      {name: 'inclusive', type: 'boolean', description: 'Whether to emit the first value that fails the predicate'},
    ],
  },
  {
    name: 'takeUntil',
    signature: 'takeUntil<T>(notifier: Sub<unknown>): Operator<T, T>',
    description: 'Emits source values until the notifier emits.',
    category: 'filtering',
    example: `const values$ = pipeFrom(
  interval(1000),
  takeUntil(stop)
);`,
    parameters: [{name: 'notifier', type: 'Sub<unknown>', description: 'Stream whose first value stops the source'}],
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
    parameters: [{name: 'count', type: 'number', description: 'Number of values to skip'}],
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
    parameters: [
      {name: 'compareFn', type: '(a: K, b: K) => boolean', description: 'Optional comparison function'},
      {name: 'keySelector', type: '(value: T) => K', description: 'Optional function that selects the compared key'},
    ],
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
    parameters: [{name: 'sources', type: 'Sub<T>[]', description: 'Streams to merge'}],
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
    parameters: [{name: 'sources', type: 'Sub<T>[]', description: 'Streams to combine'}],
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
    parameters: [{name: 'sources', type: 'Sub<T>[]', description: 'Streams to zip'}],
  },
  {
    name: 'withLatestFrom',
    signature: 'withLatestFrom<T>(...others: Sub<unknown>[]): Operator<T, [T, ...unknown[]]>',
    description: 'Combines each source value with the latest values from other streams.',
    category: 'combination',
    example: `const values$ = pipeFrom(
  clicks$,
  withLatestFrom(state)
);`,
    parameters: [{name: 'others', type: 'Sub<unknown>[]', description: 'Streams that provide the latest accompanying values'}],
  },

  // Utility Operators
  {
    name: 'tap',
    signature: 'tap<T>(tapFn: (value: T) => void): Operator<T, T>',
    description: 'Runs a side effect for each value and forwards the value unchanged.',
    category: 'utility',
    example: `const logged$ = pipeFrom(
  of(1, 2, 3),
  tap(x => console.log('Value:', x))
);`,
    parameters: [{name: 'tapFn', type: '(value: T) => void', description: 'Function called for each value'}],
  },
  {
    name: 'delay',
    signature: 'delay<T = void>(ms: number): Operator<T, T>',
    description: 'Delays every source value by the specified duration.',
    category: 'utility',
    example: `const delayed$ = pipeFrom(of(1, 2, 3), delay(500));`,
    parameters: [{name: 'ms', type: 'number', description: 'Delay in milliseconds'}],
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
    parameters: [{name: 'dueTime', type: 'number', description: 'Time in milliseconds to wait'}],
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
    parameters: [
      {name: 'duration', type: 'number', description: 'Time period in milliseconds'},
      {name: 'options', type: '{leading?: boolean; trailing?: boolean}', description: 'Optional leading and trailing emission behavior'},
    ],
  },
  {
    name: 'timeout',
    signature: 'timeout<T>(ms: number, errorFactory?: () => Error): Operator<T, T>',
    description: 'Errors if the source does not emit within the specified duration.',
    category: 'utility',
    example: `const guarded$ = pipeFrom(request$, timeout(5000));`,
    parameters: [
      {name: 'ms', type: 'number', description: 'Timeout duration in milliseconds'},
      {name: 'errorFactory', type: '() => Error', description: 'Optional custom error factory'},
    ],
  },
  {
    name: 'startWith',
    signature: 'startWith<T>(...values: T[]): Operator<T, T>',
    description: 'Emits the provided values before subscribing to the source.',
    category: 'utility',
    example: `const values$ = pipeFrom(of(2, 3), startWith(1));`,
    parameters: [{name: 'values', type: 'T[]', description: 'Values to prepend'}],
  },
  {
    name: 'endWith',
    signature: 'endWith<T>(...values: T[]): Operator<T, T>',
    description: 'Emits the provided values after the source completes.',
    category: 'utility',
    example: `const values$ = pipeFrom(of(1, 2), endWith(3));`,
    parameters: [{name: 'values', type: 'T[]', description: 'Values to append'}],
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
    parameters: [],
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
    parameters: [{name: 'selector', type: '(error: unknown, caught: Sub<T>) => Sub<R>', description: 'Function to handle errors'}],
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
    parameters: [{name: 'count', type: 'number', description: 'Number of retry attempts'}],
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
    parameters: [{name: 'notifier', type: '(errors: Sub<unknown>) => Sub<unknown>', description: 'Function that controls retry timing'}],
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
    parameters: [
      {name: 'accumulator', type: '(acc: R, value: T, index: number) => R', description: 'Accumulator function'},
      {name: 'seed', type: 'R', description: 'Optional initial accumulator value'},
    ],
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
    parameters: [
      {name: 'accumulator', type: '(acc: R, value: T, index: number) => R', description: 'Accumulator function'},
      {name: 'seed', type: 'R', description: 'Optional initial accumulator value'},
    ],
  },
];

const categories = [
  {id: 'all', name: 'All', description: 'All operators and functions'},
  {id: 'core', name: 'Core', description: 'Core composition and conversion helpers'},
  {id: 'creation', name: 'Creation', description: 'Functions that create streams'},
  {id: 'transformation', name: 'Transformation', description: 'Transform values or streams'},
  {id: 'filtering', name: 'Filtering', description: 'Filter and select values'},
  {id: 'combination', name: 'Combination', description: 'Combine multiple streams'},
  {id: 'utility', name: 'Utility', description: 'Utility and helper operators'},
  {id: 'error-handling', name: 'Error Handling', description: 'Handle errors and failures'},
  {id: 'mathematical', name: 'Mathematical', description: 'Mathematical operations'},
];

export function APIReference() {
  const {language} = useLanguage();
  const params = useParams();
  const [searchTerm, setSearchTerm] = createSignal('');
  const [selectedCategory, setSelectedCategory] = createSignal(params.category || 'all');

  const filteredOperators = () => {
    const category = selectedCategory();
    const search = searchTerm().toLowerCase();

    return operators.filter((op) => {
      const matchesCategory = category === 'all' || op.category === category;
      const description = language() === 'zh' ? OPERATOR_DESCRIPTIONS_ZH[op.name] : op.description;
      const matchesSearch = !search || op.name.toLowerCase().includes(search) || description.toLowerCase().includes(search);
      return matchesCategory && matchesSearch;
    });
  };

  return (
    <div class="api-reference-page">
      <div class="page-container">
        {/* Header */}
        <div>
          <h1>{language() === 'zh' ? 'API 参考' : 'API Reference'}</h1>
          <p>{language() === 'zh' ? 'rx4u 操作符、创建函数和工具函数的完整文档。' : 'Complete documentation of all rx4u operators, creation functions, and utilities.'}</p>
        </div>

        {/* Search and Filter */}
        <div>
          <div>
            <input
              type="text"
              placeholder={language() === 'zh' ? '搜索操作符...' : 'Search operators...'}
              value={searchTerm()}
              onInput={(e) => setSearchTerm(e.target.value)}

            />
          </div>

          <div>
            <For each={categories}>
              {(category) => (
                <button
                  onClick={() => setSelectedCategory(category.id)}
                  class={`category-button ${selectedCategory() === category.id ? 'is-selected' : ''}`}
                  title={language() === 'zh' ? CATEGORY_LABELS[category.id] : category.description}
                >
                  {language() === 'zh' ? CATEGORY_LABELS[category.id] : category.name}
                </button>
              )}
            </For>
          </div>
        </div>

        {/* Operators Grid */}
        <div>
          <For each={filteredOperators()}>
            {(operator) => (
              <div class="api-operator-card" id={operator.name}>
                <div class="api-operator-card-content">
                  <div class="api-operator-heading">
                    <h3>{operator.name}</h3>
                    <span>{language() === 'zh' ? CATEGORY_LABELS[operator.category] : operator.category}</span>
                  </div>

                  <div class="api-operator-signature">
                    <code>{operator.signature}</code>
                  </div>

                  <p class="api-operator-description">{language() === 'zh' ? OPERATOR_DESCRIPTIONS_ZH[operator.name] : operator.description}</p>

                  <Show when={operator.parameters && operator.parameters.length > 0}>
                    <div class="api-operator-details">
                      <h4>{language() === 'zh' ? '参数：' : 'Parameters:'}</h4>
                      <ul>
                        <For each={operator.parameters}>
                          {(param) => (
                            <li>
                              <code>{param.name}</code>: {param.type} - {language() === 'zh' ? PARAMETER_DESCRIPTIONS_ZH[param.description] : param.description}
                            </li>
                          )}
                        </For>
                      </ul>
                    </div>
                  </Show>

                  <Show when={operator.example}>
                    <div class="api-operator-details">
                      <h4>{language() === 'zh' ? '示例：' : 'Example:'}</h4>
                      <CodeBlock code={operator.example!} />
                    </div>
                  </Show>
                </div>
              </div>
            )}
          </For>
        </div>

        <Show when={filteredOperators().length === 0}>
          <div>
            <p>{language() === 'zh' ? '未找到符合条件的操作符。' : 'No operators found matching your criteria.'}</p>
          </div>
        </Show>
      </div>
    </div>
  );
}
