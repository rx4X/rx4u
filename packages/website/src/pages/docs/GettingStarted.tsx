import {A} from '@solidjs/router';

import {CodeBlock} from '../../components/CodeBlock';
import {useLanguage} from '../../components/LanguageProvider';

export function GettingStarted() {
  const {language} = useLanguage();
  const isChinese = () => language() === 'zh';

  return (
    <article class="documentation-page getting-started-page">
      <h1>{isChinese() ? '开始使用 rx4u' : 'Getting Started with rx4u'}</h1>

      <p>
        {isChinese()
          ? 'rx4u 是面向 JavaScript 和 TypeScript 的函数式响应式编程库，是轻量、纯函数的 RxJS 替代方案。本指南将帮助你快速上手。'
          : 'rx4u is a functional reactive programming library for JavaScript and TypeScript that provides a lightweight, pure functional alternative to RxJS. This guide will help you get started quickly.'}
      </p>

      <h2>{isChinese() ? '安装' : 'Installation'}</h2>

      <p>{isChinese() ? '使用喜欢的包管理器安装 rx4u：' : 'Install rx4u using your preferred package manager:'}</p>

      <div class="install-command-grid">
        <CodeBlock code="npm install rx4u" language="npm" />
        <CodeBlock code="pnpm add rx4u" language="pnpm" />
        <CodeBlock code="yarn add rx4u" language="yarn" />
      </div>

      <h2>{isChinese() ? '快速开始' : 'Quick Start'}</h2>

      <p>{isChinese() ? '以下是一个帮助你开始使用 rx4u 的简单示例：' : "Here's a simple example to get you started with rx4u:"}</p>

      <div>
        <div>
          <CodeBlock
            language="TypeScript"
            code={`import { of, pipeFrom, map, filter, take } from 'rx4u';

// Create a stream from values
const numbers$ = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// Apply operators using pipeFrom
const result$ = pipeFrom(
  numbers$,
  filter(x => x % 2 === 0),  // Only even numbers
  map(x => x * 2),           // Double each number
  take(3)                    // Take only first 3 results
);

// Subscribe to the stream
result$(
  value => console.log('Next:', value),      // 4, 8, 12
  error => console.error('Error:', error),
  () => console.log('Complete!')
);`}
          />
        </div>
      </div>

      <h2>{isChinese() ? '核心概念' : 'Core Concepts'}</h2>

      <h3>{isChinese() ? '1. 函数式方法' : '1. Functional Approach'}</h3>

      <p>{isChinese() ? '不同于 RxJS 的面向对象方法，rx4u 使用纯函数：' : "Unlike RxJS's object-oriented approach, rx4u uses pure functions:"}</p>

      <div>
        <div>
          <div>
            <h4>RxJS {isChinese() ? '（面向对象）' : '(Object-Oriented)'}</h4>
            <CodeBlock
              code={`observable.pipe(
  map(x => x * 2),
  filter(x => x > 5)
)`}
            />
          </div>
        </div>
        <div>
          <div>
            <h4>rx4u {isChinese() ? '（函数式）' : '(Functional)'}</h4>
            <CodeBlock
              code={`pipeFrom(stream$,
  map(x => x * 2),
  filter(x => x > 5)
)`}
            />
          </div>
        </div>
      </div>

      <h3>{isChinese() ? '2. 惰性执行' : '2. Lazy Execution'}</h3>

      <p>{isChinese() ? 'rx4u 流采用惰性执行，只有订阅后才会执行：' : "rx4u streams are lazy - they don't execute until subscribed to:"}</p>

      <div>
        <div>
          <CodeBlock
            code={`const stream$ = pipeFrom(
  from(() => {
    console.log('Factory called!');  // Only when subscribed
    return [1, 2, 3];
  }),
  map(x => {
    console.log('Processing:', x);   // Only runs when subscribed
    return x * 2;
  })
);

// Nothing happens yet...

stream$(console.log); // Now the processing starts`}
          />
        </div>
      </div>

      <h3>{isChinese() ? '3. 简单的订阅模型' : '3. Simple Subscription Model'}</h3>

      <p>{isChinese() ? 'rx4u 为订阅提供简单的函数签名。每次调用都会返回一个取消订阅函数：' : 'rx4u uses a simple function signature for subscriptions. Each call returns an unsubscribe function:'}</p>

      <div>
        <div>
          <CodeBlock
            code={`const unsubscribe = stream$(
  next,      // (value: T) => void
  error,     // (error: unknown) => void  [optional]
  complete   // () => void                [optional]
);

// Clean up when done
unsubscribe();`}
          />
        </div>
      </div>

      <h3>{isChinese() ? '4. 独立订阅' : '4. Independent Subscriptions'}</h3>

      <p>{isChinese() ? '默认情况下，每次订阅都会创建独立的执行：' : 'By default, each subscription creates an independent execution:'}</p>

      <div>
        <div>
          <CodeBlock
            code={`const random$ = from(() => Math.random());

random$(x => console.log('Sub 1:', x));  // Different value
random$(x => console.log('Sub 2:', x));  // Different value

// Use share() to share a single execution:
import { share } from 'rx4u';

const sharedRandom$ = pipeFrom(random$, share());
sharedRandom$(x => console.log('Shared 1:', x));  // Same value
sharedRandom$(x => console.log('Shared 2:', x));  // Same value`}
          />
        </div>
      </div>

      <h2>{isChinese() ? '流创建函数' : 'Stream Creation Functions'}</h2>

      <p>{isChinese() ? 'rx4u 提供多种创建流的方式：' : 'rx4u provides several ways to create streams:'}</p>

      <div>
        <div>
          <h4>from() - {isChinese() ? '从工厂函数创建' : 'From factory function'}</h4>
          <CodeBlock
            code={`from(() => Math.random())
from(() => crypto.randomUUID())`}
          />
        </div>
        <div>
          <h4>fromPromise() - {isChinese() ? '从 Promise 工厂创建' : 'From Promise factory'}</h4>
          <CodeBlock code="fromPromise(() => fetch('/api/data'))" />
        </div>
        <div>
          <h4>of() - {isChinese() ? '从单个值创建' : 'From individual values'}</h4>
          <CodeBlock
            code={`of(1, 2, 3, 4, 5)
of('a', 'b', 'c')`}
          />
        </div>
        <div>
          <h4>interval() - {isChinese() ? '定时器流' : 'Timer stream'}</h4>
          <CodeBlock
            code={`interval(1000)  // 0, 1, 2, ... every second
interval(500)   // 0, 1, 2, ... every 500ms`}
          />
        </div>
        <div>
          <h4>fromEvent() - {isChinese() ? 'DOM 事件' : 'DOM events'}</h4>
          <CodeBlock
            code={`fromEvent(button, 'click')
fromEvent(input, 'input')`}
          />
        </div>
      </div>

      <h2>{isChinese() ? 'TypeScript 支持' : 'TypeScript Support'}</h2>

      <p>{isChinese() ? 'rx4u 使用 TypeScript 构建，提供出色的类型安全：' : 'rx4u is built with TypeScript and provides excellent type safety:'}</p>

      <div>
        <div>
          <CodeBlock
            language="TypeScript"
            code={`import { of, pipeFrom, map, filter } from 'rx4u';

const numbers$ = of(1, 2, 3, 4, 5); // Sub<number>

const strings$ = pipeFrom(
  numbers$,
  filter(x => x > 2),      // Still Sub<number>
  map(x => x.toString())   // Now Sub<string>
);

strings$(
  value => console.log(value.toUpperCase()) // TypeScript knows value is string
);`}
          />
        </div>
      </div>

      <h2>{isChinese() ? '下一步' : 'Next Steps'}</h2>

      <div>
        <div>
          <A href="/docs/core-concepts">
            <h3>{isChinese() ? '核心概念' : 'Core Concepts'}</h3>
            <p>{isChinese() ? '了解流、操作符和组合' : 'Learn about streams, operators, and composition'}</p>
          </A>

          <A href="/docs/operators">
            <h3>{isChinese() ? '操作符' : 'Operators'}</h3>
            <p>{isChinese() ? '浏览所有可用操作符' : 'Explore all available operators'}</p>
          </A>

          <A href="/playground">
            <h3>{isChinese() ? '练习场' : 'Playground'}</h3>
            <p>{isChinese() ? '浏览可编辑的 rx4u 示例' : 'Browse editable rx4u examples'}</p>
          </A>

          <A href="/api-reference">
            <h3>{isChinese() ? 'API 参考' : 'API Reference'}</h3>
            <p>{isChinese() ? '完整 API 文档' : 'Complete API documentation'}</p>
          </A>
        </div>
      </div>

      <div>
        <h3>{isChinese() ? '从 RxJS 迁移' : 'Migration from RxJS'}</h3>
        <p>
          {isChinese()
            ? '如果你正在从 RxJS 迁移，请从上面的示例开始。主要区别是 rx4u 通过 pipeFrom 组合函数。'
            : "If you're coming from RxJS, start with the examples above. The main difference is that rx4u composes functions with pipeFrom."}
        </p>
      </div>
    </article>
  );
}
