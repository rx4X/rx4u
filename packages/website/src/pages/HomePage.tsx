import {CodeBlock} from '../components/CodeBlock';
import {useLanguage} from '../components/LanguageProvider';

const HOME_TEXT = {
  en: {
    hero: 'Functional Reactive Programming Library for JavaScript and TypeScript',
    heroDescription: 'A lightweight, pure functional alternative to RxJS with better performance and simpler composition patterns.',
    getStarted: 'Get Started',
    playground: 'Try Playground',
    simpleTitle: 'Simple. Functional. Powerful.',
    simpleDescription: 'Experience reactive programming with pure functions and elegant composition.',
    streamTitle: 'Create and transform streams effortlessly',
    functional: 'Pure functional approach',
    lazy: 'Lazy execution model',
    typeScript: 'TypeScript-first design',
    lightweight: 'Lightweight and performant',
    installationTitle: 'Get Started in Seconds',
    installationDescription: 'Install rx4u with your favorite package manager and start building reactive applications.',
    comparisonDescription: 'See how rx4u\'s functional approach compares to traditional object-oriented reactive programming.',
    objectOriented: 'RxJS (Object-Oriented)',
    functionalLabel: 'rx4u (Functional)',
    pureFunctions: 'Pure Functions',
    noClasses: 'No classes, no inheritance',
    typeScriptFirst: 'TypeScript First',
    typeInference: 'Complete type inference',
    minimalBundle: 'Minimal bundle footprint',
    why: 'Why Choose rx4u?',
    highPerformance: 'High Performance',
    highPerformanceDescription: 'Optimized for speed with minimal overhead and efficient memory usage.',
    typeSafe: 'Type Safe',
    typeSafeDescription: 'Built with TypeScript for excellent IDE support and compile-time safety.',
    functionalDesign: 'Functional Design',
    functionalDesignDescription: 'Pure functions and composable operators for predictable behavior.',
    reactiveState: 'Reactive State',
    reactiveStateDescription: 'Built-in createState and createLazyState for reactive state management.',
    memorySafe: 'Memory Safe',
    memorySafeDescription: 'Automatic cleanup on unsubscription with no hidden references.',
    treeShaking: 'Tree Shaking',
    treeShakingDescription: 'Import only what you need. Unused operators are eliminated at build time.',
  },
  zh: {
    hero: '面向 JavaScript 和 TypeScript 的函数式响应式编程库',
    heroDescription: '轻量、纯函数的 RxJS 替代方案，具备更好的性能和更简洁的组合方式。',
    getStarted: '快速开始',
    playground: '体验练习场',
    simpleTitle: '简单、函数式、强大。',
    simpleDescription: '通过纯函数和优雅组合体验响应式编程。',
    streamTitle: '轻松创建和转换流',
    functional: '纯函数式方法',
    lazy: '惰性执行模型',
    typeScript: 'TypeScript 优先设计',
    lightweight: '轻量且高性能',
    installationTitle: '几秒钟即可开始',
    installationDescription: '使用喜欢的包管理器安装 rx4u，立即开始构建响应式应用。',
    comparisonDescription: '了解 rx4u 的函数式方法与传统面向对象响应式编程的区别。',
    objectOriented: 'RxJS（面向对象）',
    functionalLabel: 'rx4u（函数式）',
    pureFunctions: '纯函数',
    noClasses: '无需类和继承',
    typeScriptFirst: 'TypeScript 优先',
    typeInference: '完整类型推导',
    minimalBundle: '极小的包体积',
    why: '为什么选择 rx4u？',
    highPerformance: '高性能',
    highPerformanceDescription: '针对速度优化，开销极低且高效使用内存。',
    typeSafe: '类型安全',
    typeSafeDescription: '基于 TypeScript 构建，提供出色的 IDE 支持和编译期安全性。',
    functionalDesign: '函数式设计',
    functionalDesignDescription: '纯函数和可组合操作符带来可预测的行为。',
    reactiveState: '响应式状态',
    reactiveStateDescription: '内置 createState 和 createLazyState，实现响应式状态管理。',
    memorySafe: '内存安全',
    memorySafeDescription: '取消订阅时自动清理，不保留隐藏引用。',
    treeShaking: '摇树优化',
    treeShakingDescription: '按需导入，未使用的操作符会在构建时移除。',
  },
};

export function HomePage() {
  const {language} = useLanguage();
  const text = () => HOME_TEXT[language()];

  return (
    <div class="home-page">
      {/* Hero Section */}
      <section>
        <div>
          <h1>rx4u</h1>
          <p>{text().hero}</p>
          <p>{text().heroDescription}</p>

          <div>
            <a href="/docs/getting-started">
              {text().getStarted}
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="/playground"

            >
              {text().playground}
            </a>
          </div>
        </div>
      </section>

      {/* Quick Example Section */}
      <section>
        <div>
          <div>
            <h2>{text().simpleTitle}</h2>
            <p>{text().simpleDescription}</p>
          </div>

          <div>
            <div>
              <h3>{text().streamTitle}</h3>
              <ul>
                <li>
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {text().functional}
                </li>
                <li>
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {text().lazy}
                </li>
                <li>
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {text().typeScript}
                </li>
                <li>
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {text().lightweight}
                </li>
              </ul>
            </div>

            <div>
              <CodeBlock
                code={`import { of, pipeFrom, map, filter, take } from 'rx4u';

// Create a stream from values
const numbers$ = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// Compose operators with pipeFrom
const result$ = pipeFrom(
  numbers$,
  filter(x => x % 2 === 0),  // Keep even numbers
  map(x => x * 2),           // Double each
  take(3)                    // Take first 3
);

// Subscribe to the stream
result$(
  value => console.log(value),    // 4, 8, 12
  error => console.error(error),
  () => console.log('Complete!')
);`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Installation Section */}
      <section>
        <div>
          <div>
            <h2>{text().installationTitle}</h2>
            <p>{text().installationDescription}</p>
          </div>

          <div>
            <div class="install-command-grid">
              <CodeBlock code="npm install rx4u" language="npm" />
              <CodeBlock code="pnpm add rx4u" language="pnpm" />
              <CodeBlock code="yarn add rx4u" language="yarn" />
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section>
        <div>
          <div>
            <h2>rx4u vs RxJS</h2>
            <p>{text().comparisonDescription}</p>
          </div>

          <div>
            {/* RxJS Example */}
            <div>
              <h3>
                {text().objectOriented}
              </h3>
              <div>
                <CodeBlock
                  code={`import { of, map, filter, take } from 'rxjs';

const numbers$ = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

const result$ = numbers$.pipe(
  filter(x => x % 2 === 0),
  map(x => x * 2),
  take(3)
);

result$.subscribe(
  value => console.log(value),
  error => console.error(error),
  () => console.log('Complete!')
);`}
                />
              </div>
            </div>

            {/* rx4u Example */}
            <div>
              <h3>
                {text().functionalLabel}
              </h3>
              <div>
                <CodeBlock
                  code={`import { of, pipeFrom, map, filter, take } from 'rx4u';

const numbers$ = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

const result$ = pipeFrom(
  numbers$,
  filter(x => x % 2 === 0),
  map(x => x * 2),
  take(3)
);

result$(
  value => console.log(value),
  error => console.error(error),
  () => console.log('Complete!')
);`}
                />
              </div>
            </div>
          </div>

          <div class="comparison-benefits">
            <div class="comparison-benefit">
              <div class="comparison-benefit-title">{text().pureFunctions}</div>
              <div class="comparison-benefit-description">{text().noClasses}</div>
            </div>
            <div class="comparison-benefit">
              <div class="comparison-benefit-title">{text().typeScriptFirst}</div>
              <div class="comparison-benefit-description">{text().typeInference}</div>
            </div>
            <div class="comparison-benefit">
              <div class="comparison-benefit-title">{text().lightweight}</div>
              <div class="comparison-benefit-description">{text().minimalBundle}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div>
          <div>
            <h2>{text().why}</h2>
          </div>

          <div>
            <div class="feature-card">
              <div class="feature-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3>{text().highPerformance}</h3>
              <p>{text().highPerformanceDescription}</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3>{text().typeSafe}</h3>
              <p>{text().typeSafeDescription}</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <h3>{text().functionalDesign}</h3>
              <p>{text().functionalDesignDescription}</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3>{text().reactiveState}</h3>
              <p>{text().reactiveStateDescription}</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3>{text().memorySafe}</h3>
              <p>{text().memorySafeDescription}</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3>{text().treeShaking}</h3>
              <p>{text().treeShakingDescription}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
