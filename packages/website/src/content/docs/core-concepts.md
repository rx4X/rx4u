# Core Concepts

Understanding the fundamental concepts of rx4u will help you build efficient and maintainable reactive applications.

## Functional Reactive Programming

rx4u implements Functional Reactive Programming (FRP) through three core principles:

### 1. Pure Functions

Operators are functions rather than methods on a stream object. Calling an operator creates a reusable transformation; stateful operators keep their state within each subscription:

```typescript
import {map} from 'rx4u';

// Pure function - same input always produces same output
const double = map((x) => x * 2);

// Can be reused safely
const stream1 = pipeFrom(source1, double);
const stream2 = pipeFrom(source2, double);
```

### 2. Immutability

Stream transformations create new stream instances rather than modifying existing ones:

```typescript
const originalStream = of(1, 2, 3);
const mappedStream = pipeFrom(
  originalStream,
  map((x) => x * 2)
);

// originalStream is unchanged
// mappedStream is a new, independent stream
```

### 3. Function Composition

Complex behavior emerges from composing simple functions:

```typescript
const processNumbers = (source) =>
  pipeFrom(
    source,
    filter((x) => x > 0),
    map((x) => x * 2),
    distinctUntilChanged(),
    debounceTime(100)
  );
```

## Stream Representation (Sub<T>)

In rx4u, streams are represented by the `Sub<T>` type - a function that accepts callbacks:

```typescript
type Sub<T> = (next?: (value: T) => void, error?: (error: unknown) => void, complete?: () => void) => () => void;
```

### Example Usage

```typescript
const stream: Sub<number> = of(1, 2, 3);

const unsubscribe = stream(
  (value) => console.log('Received:', value),
  (error) => console.error('Error:', error),
  () => console.log('Stream completed')
);

// Later...
unsubscribe();
```

## Lazy Execution

rx4u streams are lazy - computation only happens when subscribed:

```typescript
const expensiveOperation = pipeFrom(
  of(1, 2, 3, 4, 5),
  map((x) => {
    console.log('Processing:', x); // Only runs when subscribed
    return heavyComputation(x);
  })
);

// No computation has happened yet

expensiveOperation(console.log); // Now the work begins
```

## Subscription Model

### Independent Subscriptions

By default, each subscription creates an independent execution:

```typescript
const stream = pipeFrom(
  interval(1000),
  map(() => Math.random())
);

stream((x) => console.log('Sub 1:', x)); // Gets random values
stream((x) => console.log('Sub 2:', x)); // Gets different random values
```

### Shared Subscriptions

Use the `share` operator to share execution between subscribers:

```typescript
const sharedStream = pipeFrom(
  interval(1000),
  map(() => Math.random()),
  share()
);

sharedStream((x) => console.log('Sub 1:', x)); // Gets same values
sharedStream((x) => console.log('Sub 2:', x)); // Gets same values
```

## Operator Composition with pipeFrom

The `pipeFrom` function enables elegant operator composition:

```typescript
import {pipeFrom, map, filter, take, debounceTime} from 'rx4u';

const processedStream = pipeFrom(
  sourceStream,
  filter((x) => x.length > 0),
  map((x) => x.trim().toLowerCase()),
  debounceTime(300),
  distinctUntilChanged(),
  take(10)
);
```

### Type Safety

Operators are fully typed, ensuring type safety throughout the pipeline:

```typescript
const numbers = of(1, 2, 3, 4, 5); // Sub<number>

const result = pipeFrom(
  numbers,
  filter((x) => x > 2), // Sub<number>
  map((x) => x.toString()), // Sub<string>
  map((x) => x.length) // Sub<number>
);
```

## Stream Lifecycle

### Creation

Streams can be created from various sources:

```typescript
// From arrays
const arrayStream = of(1, 2, 3);

// From single values
const valueStream = of('hello');

// From intervals
const timerStream = interval(1000);

// From promises
const promiseStream = fromPromise(() => fetch('/api/data'));
```

### Transformation

Transform streams using operators:

```typescript
const transformed = pipeFrom(source, map(transform), filter(predicate), distinctUntilChanged());
```

### Subscription

Subscribe to receive values:

```typescript
const unsubscribe = stream(next, error, complete);
```

### Cleanup

Always clean up subscriptions to prevent memory leaks:

```typescript
const unsubscribe = stream(handleValue);

// In cleanup code (e.g., component unmount)
unsubscribe();
```

## Error Handling

rx4u provides several strategies for handling errors:

### catchError

Handle errors and continue with a fallback stream:

```typescript
const resilientStream = pipeFrom(
  riskyStream,
  catchError((error) => of('fallback value'))
);
```

### retry

Automatically retry failed operations:

```typescript
const retriedStream = pipeFrom(
  unreliableStream,
  retry(3) // Retry up to 3 times
);
```

### retryWhen

Conditional retry with custom logic:

```typescript
const smartRetry = pipeFrom(
  stream,
  retryWhen((errors) => pipeFrom(errors, debounceTime(1000), take(5)))
);
```

## Memory Management

rx4u is designed to be memory efficient:

- Operators release their subscription resources after completion or unsubscription
- Unsubscription stops future emissions; an already-running Promise cannot itself be cancelled
- Shared and state streams expose explicit cleanup behavior

```typescript
// Automatic cleanup
const unsubscribe = stream(handleValue);
unsubscribe(); // Stops future emissions and releases subscription resources
```

## Next Steps

- Explore all available [Operators](/docs/operators)
- Review stream creation functions in the [API Reference](/api)
- Check out the [Examples](/examples)
- Browse examples in the [Playground](/playground)
