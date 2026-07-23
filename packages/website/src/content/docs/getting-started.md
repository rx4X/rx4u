# Getting Started with rx4u

rx4u is a functional reactive programming library for JavaScript and TypeScript that provides a lightweight, pure functional alternative to RxJS. This guide will help you get started quickly.

## Installation

Install rx4u using your preferred package manager:

```bash
npm install rx4u
# or
pnpm add rx4u
# or
yarn add rx4u
```

## Quick Start

Here's a simple example to get you started with rx4u:

```typescript
import {of, pipeFrom, map, filter, take} from 'rx4u';

// Create a stream from values
const numbers = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// Apply operators using pipeFrom
const result = pipeFrom(
  numbers,
  filter((x) => x % 2 === 0), // Only even numbers
  map((x) => x * 2), // Double each number
  take(3) // Take only first 3 results
);

// Subscribe to the stream
result(
  (value) => console.log('Next:', value), // 4, 8, 12
  (error) => console.error('Error:', error),
  () => console.log('Complete!')
);
```

## Core Concepts

### 1. Functional Approach

Unlike RxJS's object-oriented approach, rx4u uses pure functions:

```typescript
// RxJS (object-oriented)
observable.pipe(
  map((x) => x * 2),
  filter((x) => x > 5)
);

// rx4u (functional)
pipeFrom(
  stream,
  map((x) => x * 2),
  filter((x) => x > 5)
);
```

### 2. Lazy Execution

rx4u streams are lazy - they don't execute until subscribed to:

```typescript
const stream = pipeFrom(
  of(1, 2, 3),
  map((x) => {
    console.log('Processing:', x); // Only logs when subscribed
    return x * 2;
  })
);

// Nothing happens yet...

stream(console.log); // Now the processing starts
```

### 3. Simple Subscription Model

rx4u uses a simple function signature for subscriptions:

```typescript
const unsubscribe = stream(
  next, // (value: T) => void
  error, // (error: unknown) => void  [optional]
  complete // () => void           [optional]
);

// Clean up when done
unsubscribe();
```

## TypeScript Support

rx4u is built with TypeScript and provides excellent type safety:

```typescript
import {of, pipeFrom, map, filter} from 'rx4u';

const numbers = of(1, 2, 3, 4, 5); // Sub<number>

const strings = pipeFrom(
  numbers,
  filter((x) => x > 2), // Still Sub<number>
  map((x) => x.toString()) // Now Sub<string>
);

strings(
  (value) => console.log(value.toUpperCase()) // TypeScript knows value is string
);
```

## Next Steps

- Learn about [Core Concepts](/docs/core-concepts)
- Explore all available [Operators](/docs/operators)
- Browse examples in the [Playground](/playground)
- Check the [API Reference](/api)

## Migration from RxJS

If you're coming from RxJS, start with the examples above. The main difference is that rx4u composes functions with `pipeFrom`.
