# rx4u

rx4u is a small reactive stream library for JavaScript and TypeScript.

It is inspired by RxJS, but it uses plain functions instead of Observable classes. A stream is just a function. Operators are also functions. You compose them with `pipeFrom`.

## Features

- 🚀 **Pure Functional Design** - Avoids object-oriented patterns, embraces functional programming paradigms
- ⚡ **Lazy Execution** - Operators execute only when subscribed
- 🔄 **Independent Subscriptions** - Each subscription is isolated by default
- 🤝 **Shared Operators** - Use `share` operator to let multiple subscribers share the same source
- 🧩 **Rich Operator Set** - 20+ common operators including transformation, combination, utility, and error handling
- 📦 **TypeScript Support** - Complete type definitions and type inference
- 🏗️ **Modular Architecture** - Independent package structure with tree-shaking support
- ⚡ **Lightweight** - Simplified stream implementation with high performance
- 🧪 **Automated Tests** - Coverage for core streams, creation functions, and operators

## Installation

```bash
npm install rx4u
```

```bash
pnpm add rx4u
```

```bash
yarn add rx4u
```

## Quick Start

```ts
import {of, pipeFrom, filter, map, take} from 'rx4u';

const numbers$ = of(1, 2, 3, 4, 5, 6);

const result$ = pipeFrom(
  numbers$,
  filter((value) => value % 2 === 0),
  map((value) => value * 10),
  take(2)
);

const unsubscribe = result$(
  (value) => console.log(value),
  (error) => console.error(error),
  () => console.log('done')
);

unsubscribe();
```

Output:

```txt
20
40
done
```

## Core Types

### `Sub<T>`

A `Sub<T>` is a stream. It receives `next`, `error`, and `complete` callbacks. It returns an unsubscribe function.

```ts
type Sub<T> = (next?: (value: T) => void, error?: (error: unknown) => void, complete?: () => void) => () => void;
```

### `Operator<T, R>`

An `Operator<T, R>` converts a stream of `T` values into a stream of `R` values.

```ts
type Operator<T, R> = (source: Sub<T>) => Sub<R>;
```

## Core Helpers

### `pipeFrom(source, ...operators)`

`pipeFrom` applies operators to a source stream from left to right.

Use it when you want readable stream pipelines.

```ts
import {of, pipeFrom, map, filter} from 'rx4u';

const result$ = pipeFrom(
  of(1, 2, 3),
  filter((value) => value > 1),
  map((value) => value * 2)
);
```

### `firstValueFrom(source)`

`firstValueFrom` turns a stream into a Promise. It resolves with the first emitted value.

It rejects if the stream errors, or if the stream completes without any value.

```ts
import {firstValueFrom, of} from 'rx4u';

const value = await firstValueFrom(of(42));
```

## Creation Functions

### `from(create)`

Creates a stream from a synchronous factory function. The factory runs once for each subscription.

```ts
import {from} from 'rx4u';

const random$ = from(() => Math.random());
```

### `of(...values)`

Creates a stream from values. It emits each value, then completes.

```ts
import {of} from 'rx4u';

const numbers$ = of(1, 2, 3);
```

### `interval(period)`

Creates a stream that emits `0, 1, 2, ...` every `period` milliseconds.

```ts
import {interval, take, pipeFrom} from 'rx4u';

const ticks$ = pipeFrom(interval(1000), take(3));
```

### `fromPromise(create)`

Creates a stream from a Promise factory. The factory runs when you subscribe.

```ts
import {fromPromise} from 'rx4u';

const user$ = fromPromise(() => fetch('/api/user').then((res) => res.json()));
```

### `fromEvent(target, type, options?)`

Creates a stream from DOM-like events.

```ts
import {fromEvent} from 'rx4u';

const clicks$ = fromEvent<MouseEvent>(button, 'click');
```

### `createState(initialValue)`

Creates reactive state with an initial value.

It returns `[state$, setState, getState, destroy]`.

```ts
import {createState} from 'rx4u';

const [count$, setCount, getCount, destroy] = createState(0);

count$((value) => console.log(value));
setCount((value) => value + 1);
console.log(getCount());
destroy();
```

### `createLazyState<T>()`

Creates reactive state without an initial value.

It returns `[state$, setState, getState, destroy]`. Subscribers only receive a value after `setState` is called.

```ts
import {createLazyState} from 'rx4u';

const [name$, setName] = createLazyState<string>();

name$((value) => console.log(value));
setName('Ada');
```

### `createSubject<T>()`

Creates a simple multicast stream.

It returns `[subject$, next]`. Calling `next(value)` sends the value to all current subscribers.

```ts
import {createSubject} from 'rx4u';

const [message$, nextMessage] = createSubject<string>();

message$((value) => console.log(value));
nextMessage('hello');
```

## Operators

### `map(mapFn)`

Transforms each value.

```ts
pipeFrom(
  of(1, 2),
  map((value) => value * 2)
);
```

### `filter(predicate)`

Only emits values that pass the predicate.

```ts
pipeFrom(
  of(1, 2, 3),
  filter((value) => value > 1)
);
```

### `share()`

Shares one source subscription between many subscribers.

```ts
const shared$ = pipeFrom(fromPromise(loadData), share());
```

### `merge(...sources)`

Combines many streams into one stream by forwarding values from all sources.

```ts
const all$ = merge(of(1, 2), of(3, 4));
```

### `combineLatest(...sources)`

Emits the latest values from all sources after every source has emitted at least once.

```ts
const combined$ = combineLatest(of(1, 2), of('a', 'b'));
```

### `zip(...sources)`

Pairs values from multiple sources by order.

```ts
const pairs$ = zip(of(1, 2), of('a', 'b'));
```

### `withLatestFrom(...others)`

Combines each source value with the latest values from other streams.

```ts
const result$ = pipeFrom(clicks$, withLatestFrom(state$));
```

### `take(count)`

Emits only the first `count` values, then completes.

```ts
pipeFrom(interval(1000), take(3));
```

### `takeWhile(predicate, inclusive?)`

Emits values while the predicate returns `true`.

If `inclusive` is `true`, it also emits the first value that fails the predicate.

```ts
pipeFrom(
  of(1, 2, 3),
  takeWhile((value) => value < 3)
);
```

### `takeUntil(notifier)`

Emits source values until the notifier stream emits.

```ts
pipeFrom(source$, takeUntil(stop$));
```

### `skip(count)`

Skips the first `count` values.

```ts
pipeFrom(of(1, 2, 3), skip(1));
```

### `delay(ms)`

Delays each value by `ms` milliseconds.

```ts
pipeFrom(of('ready'), delay(500));
```

### `debounceTime(delay)`

Waits for a quiet period, then emits the latest value.

This is useful for search input.

```ts
pipeFrom(input$, debounceTime(300));
```

### `distinctUntilChanged(compareFn?, keySelector?)`

Skips a value when it is the same as the previous value.

You can pass a custom compare function or a key selector.

```ts
pipeFrom(of(1, 1, 2), distinctUntilChanged());
```

### `tap(tapFn)`

Runs a side effect for each value without changing the value.

```ts
pipeFrom(
  source$,
  tap((value) => console.log(value))
);
```

### `timeout(ms, errorFactory?)`

Errors if the source does not emit within `ms` milliseconds.

```ts
pipeFrom(request$, timeout(5000));
```

### `switchMap(project)`

Maps each value to an inner stream or Promise and keeps only the latest one.

This is useful for search requests where old requests should be ignored.

```ts
pipeFrom(
  query$,
  switchMap((query) => fromPromise(() => search(query)))
);
```

### `mergeMap(project, concurrent?)`

Maps each value to an inner stream and merges the results.

Use `concurrent` to limit how many inner streams run at the same time.

```ts
pipeFrom(
  ids$,
  mergeMap((id) => fromPromise(() => loadUser(id)), 4)
);
```

### `concatMap(project)`

Maps each value to an inner stream and runs them one at a time, in order.

```ts
pipeFrom(
  tasks$,
  concatMap((task) => fromPromise(() => runTask(task)))
);
```

### `catchError(selector)`

Handles an error by switching to a fallback stream.

```ts
pipeFrom(
  risky$,
  catchError(() => of('fallback'))
);
```

### `retry(count?)`

Retries the source when it errors. The default count is `3`.

```ts
pipeFrom(request$, retry(2));
```

### `retryWhen(notifier)`

Retries when the notifier stream emits.

Use it for custom retry timing or retry rules.

```ts
pipeFrom(
  request$,
  retryWhen((errors$) => pipeFrom(errors$, delay(1000), take(3)))
);
```

### `startWith(...values)`

Emits values before the source starts.

```ts
pipeFrom(data$, startWith('loading'));
```

### `endWith(...values)`

Emits values after the source completes.

```ts
pipeFrom(data$, endWith('done'));
```

### `throttleTime(duration, options?)`

Limits how often values are emitted.

By default it emits the first value in each time window. You can also enable trailing values.

```ts
pipeFrom(scroll$, throttleTime(1000, {leading: true, trailing: true}));
```

### `scan(accumulator, seed?)`

Keeps running state and emits each intermediate result.

```ts
pipeFrom(
  of(1, 2, 3),
  scan((sum, value) => sum + value, 0)
);
```

### `reduce(accumulator, seed?)`

Keeps running state and emits only the final result when the source completes.

```ts
pipeFrom(
  of(1, 2, 3),
  reduce((sum, value) => sum + value, 0)
);
```

## Project Structure

```txt
rx4u/
├── packages/
│   ├── rx4u/       # Library source
│   ├── examples/   # Usage examples
│   └── website/    # Documentation website
├── pnpm-workspace.yaml
└── package.json
```

## Development

Install dependencies:

```bash
pnpm install
```

Run tests:

```bash
pnpm --filter rx4u test:run
```

Build the package:

```bash
pnpm --filter rx4u build
```

## License

MIT License

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📞 Support

If you encounter any problems during usage, please:

1. Check the documentation and examples
2. Search existing Issues
3. Create a new Issue describing the problem

---

**rx4u** - Making reactive programming simpler! 🚀
