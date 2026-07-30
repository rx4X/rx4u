import {A} from '@solidjs/router';

import {CodeBlock} from '../../components/CodeBlock';
import {useLanguage} from '../../components/LanguageProvider';

export function CoreConcepts() {
  const {language} = useLanguage();
  const isChinese = () => language() === 'zh';

  return (
    <article class="documentation-page core-concepts-page">
      <h1>{isChinese() ? '核心概念' : 'Core Concepts'}</h1>

      <p>
        {isChinese()
          ? '理解 rx4u 的基础概念，有助于你构建高效、可维护的响应式应用。'
          : 'Understanding the fundamental concepts of rx4u will help you build efficient and maintainable reactive applications.'}
      </p>

      <h2>{isChinese() ? '函数式响应式编程' : 'Functional Reactive Programming'}</h2>

      <p>{isChinese() ? 'rx4u 通过三个核心原则实现函数式响应式编程（FRP）：' : 'rx4u implements Functional Reactive Programming (FRP) through three core principles:'}</p>

      <h3>{isChinese() ? '1. 纯函数' : '1. Pure Functions'}</h3>

      <p>
        {isChinese()
          ? '操作符是函数，而不是流对象上的方法。有状态操作符会在每个订阅中维护自己的状态：'
          : 'Operators are functions rather than methods on a stream object. Stateful operators keep their state within each subscription:'}
      </p>

      <div>
        <div>
          <CodeBlock
            language="TypeScript"
            code={`import { map } from 'rx4u';

// Pure function - same input always produces same output
const double = map(x => x * 2);

// Can be reused safely
const stream1$ = pipeFrom(source1$, double);
const stream2$ = pipeFrom(source2$, double);`}
          />
        </div>
      </div>

      <h3>{isChinese() ? '2. 不可变性' : '2. Immutability'}</h3>

      <p>{isChinese() ? '流转换会创建新流实例，而不是修改已有实例：' : 'Stream transformations create new stream instances rather than modifying existing ones:'}</p>

      <div>
        <div>
          <CodeBlock
            code={`const originalStream$ = of(1, 2, 3);
const mappedStream$ = pipeFrom(originalStream$, map(x => x * 2));

// originalStream$ is unchanged
// mappedStream$ is a new, independent stream`}
          />
        </div>
      </div>

      <h3>{isChinese() ? '3. 函数组合' : '3. Function Composition'}</h3>

      <p>{isChinese() ? '复杂行为源于对简单函数的组合：' : 'Complex behavior emerges from composing simple functions:'}</p>

      <div>
        <div>
          <CodeBlock
            code={`const processNumbers = (source$) => pipeFrom(
  source$,
  filter(x => x > 0),
  map(x => x * 2),
  distinctUntilChanged(),
  debounceTime(100)
);`}
          />
        </div>
      </div>

      <h2>{isChinese() ? '流的表示（Sub<T>）' : 'Stream Representation (Sub<T>)'}</h2>

      <p>
        {isChinese() ? (
          <>
            在 rx4u 中，流由 <code>Sub&lt;T&gt;</code> 类型表示，它是一个接受回调函数的函数：
          </>
        ) : (
          <>
            In rx4u, streams are represented by the <code>Sub&lt;T&gt;</code> type - a function that accepts callbacks:
          </>
        )}
      </p>

      <div>
        <div>
          <CodeBlock
            language="TypeScript"
            code={`type Sub<T> = (
  next?: (value: T) => void,
  error?: (error: unknown) => void,
  complete?: () => void
) => () => void; // Returns unsubscribe function`}
          />
        </div>
      </div>

      <h3>{isChinese() ? '使用示例' : 'Example Usage'}</h3>

      <div>
        <div>
          <CodeBlock
            language="TypeScript"
            code={`const stream$: Sub<number> = of(1, 2, 3);

const unsubscribe = stream$(
  value => console.log('Received:', value),
  error => console.error('Error:', error),
  () => console.log('Stream completed')
);

// Later...
unsubscribe();`}
          />
        </div>
      </div>

      <h2>{isChinese() ? '惰性执行' : 'Lazy Execution'}</h2>

      <p>{isChinese() ? 'rx4u 流采用惰性执行，只有订阅后才会计算：' : 'rx4u streams are lazy - computation only happens when subscribed:'}</p>

      <div>
        <div>
          <CodeBlock
            code={`const expensiveOperation$ = pipeFrom(
  of(1, 2, 3, 4, 5),
  map(x => {
    console.log('Processing:', x); // Only runs when subscribed
    return heavyComputation(x);
  })
);

// No computation has happened yet

expensiveOperation$(console.log); // Now the work begins`}
          />
        </div>
      </div>

      <h2>{isChinese() ? '订阅模型' : 'Subscription Model'}</h2>

      <h3>{isChinese() ? '独立订阅' : 'Independent Subscriptions'}</h3>

      <p>{isChinese() ? '默认情况下，每次订阅都会创建独立的执行：' : 'By default, each subscription creates an independent execution:'}</p>

      <div>
        <div>
          <CodeBlock
            code={`const stream$ = pipeFrom(
  interval(1000),
  map(() => Math.random())
);

stream$(x => console.log('Sub 1:', x)); // Gets random values
stream$(x => console.log('Sub 2:', x)); // Gets different random values`}
          />
        </div>
      </div>

      <h3>{isChinese() ? '共享订阅' : 'Shared Subscriptions'}</h3>

      <p>
        {isChinese() ? (
          <>
            使用 <code>share</code> 操作符在订阅者之间共享执行：
          </>
        ) : (
          <>
            Use the <code>share</code> operator to share execution between subscribers:
          </>
        )}
      </p>

      <div>
        <div>
          <CodeBlock
            code={`const sharedStream$ = pipeFrom(
  interval(1000),
  map(() => Math.random()),
  share()
);

sharedStream$(x => console.log('Sub 1:', x)); // Gets same values
sharedStream$(x => console.log('Sub 2:', x)); // Gets same values`}
          />
        </div>
      </div>

      <h2>{isChinese() ? '使用 pipeFrom 组合操作符' : 'Operator Composition with pipeFrom'}</h2>

      <p>
        {isChinese() ? (
          <>
            <code>pipeFrom</code> 函数实现优雅的操作符组合：
          </>
        ) : (
          <>
            The <code>pipeFrom</code> function enables elegant operator composition:
          </>
        )}
      </p>

      <div>
        <div>
          <CodeBlock
            language="TypeScript"
            code={`import { pipeFrom, map, filter, take, debounceTime } from 'rx4u';

const processedStream$ = pipeFrom(
  sourceStream$,
  filter(x => x.length > 0),
  map(x => x.trim().toLowerCase()),
  debounceTime(300),
  distinctUntilChanged(),
  take(10)
);`}
          />
        </div>
      </div>

      <h3>{isChinese() ? '类型安全' : 'Type Safety'}</h3>

      <p>{isChinese() ? '操作符具有完整类型信息，确保整条管道的类型安全：' : 'Operators are fully typed, ensuring type safety throughout the pipeline:'}</p>

      <div>
        <div>
          <CodeBlock
            language="TypeScript"
            code={`const numbers$ = of(1, 2, 3, 4, 5); // Sub<number>

const result$ = pipeFrom(
  numbers$,
  filter(x => x > 2),        // Sub<number>
  map(x => x.toString()),    // Sub<string>
  map(x => x.length)         // Sub<number>
);`}
          />
        </div>
      </div>

      <h2>{isChinese() ? '错误处理' : 'Error Handling'}</h2>

      <p>{isChinese() ? 'rx4u 提供多种错误处理策略：' : 'rx4u provides several strategies for handling errors:'}</p>

      <h3>catchError</h3>

      <p>{isChinese() ? '处理错误并使用回退流继续执行：' : 'Handle errors and continue with a fallback stream:'}</p>

      <div>
        <div>
          <CodeBlock
            code={`const resilientStream$ = pipeFrom(
  riskyStream$,
  catchError(error => of('fallback value'))
);`}
          />
        </div>
      </div>

      <h3>retry</h3>

      <p>{isChinese() ? '自动重试失败的操作：' : 'Automatically retry failed operations:'}</p>

      <div>
        <div>
          <CodeBlock
            code={`const retriedStream$ = pipeFrom(
  unreliableStream$,
  retry(3) // Retry up to 3 times
);`}
          />
        </div>
      </div>

      <h2>{isChinese() ? '内存管理' : 'Memory Management'}</h2>

      <p>{isChinese() ? 'rx4u 专为高效使用内存而设计：' : 'rx4u is designed to be memory efficient:'}</p>

      <ul>
        <li>{isChinese() ? '操作符会在完成或取消订阅后释放订阅资源' : 'Operators release subscription resources after completion or unsubscription'}</li>
        <li>{isChinese() ? '取消订阅会停止后续发出；已经运行的 Promise 本身无法取消' : 'Unsubscription stops future emissions; an already-running Promise cannot itself be cancelled'}</li>
        <li>{isChinese() ? '共享流和状态流提供显式的清理行为' : 'Shared and state streams expose explicit cleanup behavior'}</li>
      </ul>

      <div>
        <div>
          <CodeBlock
            code={`// Automatic cleanup
const unsubscribe = stream$(handleValue);
unsubscribe(); // Stops future emissions and releases subscription resources`}
          />
        </div>
      </div>

      <h2>{isChinese() ? '下一步' : 'Next Steps'}</h2>

      <div>
        <div>
          <A href="/docs/operators">
            <h3>{isChinese() ? '操作符' : 'Operators'}</h3>
            <p>{isChinese() ? '浏览所有可用操作符' : 'Explore all available operators'}</p>
          </A>

          <A href="/examples">
            <h3>{isChinese() ? '示例' : 'Examples'}</h3>
            <p>{isChinese() ? '查看 rx4u 的实际示例' : 'See rx4u in action with real examples'}</p>
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
    </article>
  );
}
