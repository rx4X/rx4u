import {createSignal, Show, For, onCleanup, onMount} from 'solid-js';
import {A} from '@solidjs/router';

import {useLanguage} from './LanguageProvider';

interface SearchResult {
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  url: string;
  category: string;
  categoryZh: string;
}

function createApiSearchResult(title: string, description: string, descriptionZh: string): SearchResult {
  return {
    title: `${title}()`,
    titleZh: `${title}()`,
    description,
    descriptionZh,
    url: `/api#${title}`,
    category: 'API',
    categoryZh: 'API',
  };
}

const API_SEARCH_RESULTS: SearchResult[] = [
  createApiSearchResult('from', 'Creates a stream from a synchronous factory function', '从同步工厂函数创建流'),
  createApiSearchResult('fromPromise', 'Creates a stream from a Promise factory', '从 Promise 工厂函数创建流'),
  createApiSearchResult('of', 'Creates a stream that emits provided values', '创建发出给定值的流'),
  createApiSearchResult('interval', 'Creates a stream that emits values at intervals', '创建按间隔发出值的流'),
  createApiSearchResult('fromEvent', 'Creates a stream from event target events', '从事件目标的事件创建流'),
  createApiSearchResult('createState', 'Creates reactive state with an initial value', '使用初始值创建响应式状态'),
  createApiSearchResult('createLazyState', 'Creates reactive state without an initial emission', '创建不含初始发出的响应式状态'),
  createApiSearchResult('createSubject', 'Creates a multicast stream', '创建多播流'),
  createApiSearchResult('pipeFrom', 'Applies operators to a source stream', '向源流应用操作符'),
  createApiSearchResult('firstValueFrom', 'Resolves with the first emitted value', '解析第一个发出的值'),
  createApiSearchResult('map', 'Transforms each emitted value', '转换每个发出的值'),
  createApiSearchResult('switchMap', 'Projects values and switches to the latest stream', '投射值并切换到最新流'),
  createApiSearchResult('mergeMap', 'Projects values and merges concurrent streams', '投射值并合并并发流'),
  createApiSearchResult('concatMap', 'Projects values and concatenates streams', '投射值并顺序连接流'),
  createApiSearchResult('filter', 'Emits values that satisfy a predicate', '发出符合谓词条件的值'),
  createApiSearchResult('take', 'Emits the first values from a stream', '发出流的前几个值'),
  createApiSearchResult('takeWhile', 'Emits while a predicate passes', '在谓词通过时持续发出值'),
  createApiSearchResult('takeUntil', 'Emits until a notifier emits', '在通知流发出前持续发出值'),
  createApiSearchResult('skip', 'Skips the first values from a stream', '跳过流的前几个值'),
  createApiSearchResult('distinctUntilChanged', 'Emits only changed values', '仅发出发生变化的值'),
  createApiSearchResult('merge', 'Merges multiple streams', '合并多个流'),
  createApiSearchResult('combineLatest', 'Combines latest values from streams', '组合流的最新值'),
  createApiSearchResult('zip', 'Combines streams pairwise', '按位置组合流'),
  createApiSearchResult('withLatestFrom', 'Combines source values with latest values', '将源值与最新值组合'),
  createApiSearchResult('tap', 'Runs a side effect for each value', '为每个值执行副作用'),
  createApiSearchResult('delay', 'Delays source values', '延迟源流的值'),
  createApiSearchResult('debounceTime', 'Emits after a silence period', '在静默期后发出值'),
  createApiSearchResult('throttleTime', 'Emits at most once per time period', '每个时间段最多发出一次'),
  createApiSearchResult('timeout', 'Errors when a stream takes too long to emit', '流长时间未发出值时触发错误'),
  createApiSearchResult('startWith', 'Emits values before the source stream', '在源流之前发出值'),
  createApiSearchResult('endWith', 'Emits values after the source completes', '在源流完成后发出值'),
  createApiSearchResult('share', 'Shares a source subscription', '共享源流订阅'),
  createApiSearchResult('catchError', 'Handles errors with a fallback stream', '使用回退流处理错误'),
  createApiSearchResult('retry', 'Retries a stream after an error', '错误后重试流'),
  createApiSearchResult('retryWhen', 'Retries with custom retry logic', '通过自定义逻辑重试'),
  createApiSearchResult('scan', 'Emits intermediate accumulator results', '发出累加器的中间结果'),
  createApiSearchResult('reduce', 'Emits the final accumulator result', '发出最终累加器结果'),
];

const searchData: SearchResult[] = [
  // Documentation pages
  {title: 'Getting Started', titleZh: '快速开始', description: 'Quick introduction and setup guide', descriptionZh: '快速介绍和安装指南', url: '/docs/getting-started', category: 'Documentation', categoryZh: '文档'},
  {title: 'Core Concepts', titleZh: '核心概念', description: 'Understanding streams, operators, and composition', descriptionZh: '理解流、操作符和组合', url: '/docs/core-concepts', category: 'Documentation', categoryZh: '文档'},
  {title: 'Operators', titleZh: '操作符', description: 'Complete guide to all available operators', descriptionZh: '完整的操作符使用指南', url: '/docs/operators', category: 'Documentation', categoryZh: '文档'},

  // API Reference
  ...API_SEARCH_RESULTS,

  // Other pages
  {title: 'Playground', titleZh: '练习场', description: 'Interactive code playground', descriptionZh: '交互式代码练习场', url: '/playground', category: 'Tools', categoryZh: '工具'},
  {title: 'API Reference', titleZh: 'API 参考', description: 'Complete API documentation', descriptionZh: '完整 API 文档', url: '/api', category: 'Reference', categoryZh: '参考'},
];

export function GlobalSearch() {
  const {language} = useLanguage();
  const [isOpen, setIsOpen] = createSignal(false);
  const [query, setQuery] = createSignal('');
  const [results, setResults] = createSignal<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [searchInputRef, setSearchInputRef] = createSignal<HTMLInputElement | null>(null);
  const [searchContainerRef, setSearchContainerRef] = createSignal<HTMLDivElement | null>(null);

  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const filteredResults = searchData
      .filter((item) => {
        const queryLower = searchQuery.toLowerCase();
        const title = language() === 'zh' ? item.titleZh : item.title;
        const description = language() === 'zh' ? item.descriptionZh : item.description;
        return title.toLowerCase().includes(queryLower) || description.toLowerCase().includes(queryLower);
      })
      .slice(0, 5); // Limit to 5 results

    setResults(filteredResults);
    setSelectedIndex(0);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen()) return;

    switch (e.key) {
      case 'Escape':
        closeSearch();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(Math.min(selectedIndex() + 1, results().length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(Math.max(selectedIndex() - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        const selected = results()[selectedIndex()];
        if (selected) {
          window.location.href = selected.url;
          closeSearch();
        }
        break;
    }
  };

  const closeSearch = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
  };

  const openSearch = () => {
    setIsOpen(true);
    setTimeout(() => searchInputRef()?.focus(), 100);
  };

  // Handle click outside
  const handleClickOutside = (e: MouseEvent) => {
    if (!searchContainerRef()?.contains(e.target as Node)) {
      closeSearch();
    }
  };

  // Global keyboard shortcut (Cmd/Ctrl + K)
  const handleGlobalKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleGlobalKeyDown);
    document.addEventListener('click', handleClickOutside);

    onCleanup(() => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
      document.removeEventListener('click', handleClickOutside);
    });
  });

  return (
    <div class="global-search" ref={setSearchContainerRef}>
      {/* Search Button */}
      <button
        onClick={openSearch}
        class="search-trigger"
        title={`${language() === 'zh' ? '搜索' : 'Search'} (⌘K)`}
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>{language() === 'zh' ? '搜索' : 'Search'}</span>
        <kbd>⌘K</kbd>
      </button>

      {/* Search Modal */}
      <Show when={isOpen()}>
        <div class="search-dialog-layer">
          {/* Backdrop */}
          <div class="search-dialog-backdrop" />

          {/* Modal */}
          <div class="search-dialog-positioner">
            <div class="search-dialog">
              {/* Search Input */}
              <div class="search-input-row">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={setSearchInputRef}
                  type="text"
                  placeholder={language() === 'zh' ? '搜索文档...' : 'Search documentation...'}
                  value={query()}
                  onInput={(e) => {
                    const value = e.target.value;
                    setQuery(value);
                    performSearch(value);
                  }}
                  onKeyDown={handleKeyDown}
                  class="search-input"
                />
              </div>

              {/* Results */}
              <div class="search-results">
                <Show
                  when={results().length > 0}
                  fallback={
                    <Show when={query().trim()}>
                      <div class="search-empty-state">{language() === 'zh' ? `未找到“${query()}”的结果` : `No results found for "${query()}"`}</div>
                    </Show>
                  }
                >
                  <For each={results()}>
                    {(result, index) => (
                      <A
                        href={result.url}
                        onClick={closeSearch}
                        class={`search-result ${selectedIndex() === index() ? 'is-selected' : ''}`}
                      >
                        <div class="search-result-content">
                          <div>
                            <h4>{language() === 'zh' ? result.titleZh : result.title}</h4>
                            <p>{language() === 'zh' ? result.descriptionZh : result.description}</p>
                          </div>
                          <span class="search-result-category">{language() === 'zh' ? result.categoryZh : result.category}</span>
                        </div>
                      </A>
                    )}
                  </For>
                </Show>
              </div>

              {/* Footer */}
              <Show when={results().length > 0}>
                <div class="search-dialog-footer">
                  <div>
                    <span>
                      <kbd>↑↓</kbd>
                      {language() === 'zh' ? '导航' : 'Navigate'}
                    </span>
                    <span>
                      <kbd>↵</kbd>
                      {language() === 'zh' ? '选择' : 'Select'}
                    </span>
                  </div>
                  <span>
                    <kbd>esc</kbd>
                    {language() === 'zh' ? '关闭' : 'Close'}
                  </span>
                </div>
              </Show>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
