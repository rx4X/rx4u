// Basic usage examples
import {of, from, fromPromise, pipeFrom, map, filter, take, share} from 'rx4u';

// Example 1: Basic Promise handling
console.log('=== Example 1: Basic Promise Handling ===');
const fetchData$ = fromPromise<string>(() => {
  return new Promise<string>((resolve) => {
    setTimeout(() => resolve('Hello rx4u!'), 1000);
  });
});

const unsub1 = fetchData$((data: string) => console.log('Received data:', data));

// Example 2: Data transformation pipeline
console.log('\n=== Example 2: Data Transformation Pipeline ===');

const numbers$ = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

const processedNumbers$ = pipeFrom(
  numbers$,
  filter((n: number) => n % 2 === 0), // Keep only even numbers
  map((n: number) => n * n), // Square
  take(3) // Take only first 3
);

const unsub2 = processedNumbers$(
  (result: number) => console.log('Processing result:', result),
  (err: unknown) => console.error('Error:', err),
  () => console.log('Complete!')
);

// Example 3: Independent subscription vs shared subscription
console.log('\n=== Example 3: Independent Subscription vs Shared Subscription ===');

// Independent subscription - source function executes each time
const randomSource$ = fromPromise<number>(() => {
  const value = Math.random();
  console.log('Generating random number:', value);
  return Promise.resolve(value);
});

console.log('Independent subscription:');
const unsub3 = randomSource$((data: number) => console.log('Subscriber 1:', data));
const unsub4 = randomSource$((data: number) => console.log('Subscriber 2:', data));

// Shared subscription - source function executes only once
const sharedRandom$ = share<number>()(randomSource$);
console.log('\nShared subscription:');

setTimeout(() => {
  const unsub5 = sharedRandom$((data: number) => console.log('Shared subscriber 1:', data));
  const unsub6 = sharedRandom$((data: number) => console.log('Shared subscriber 2:', data));
}, 2000);

// Example 4: Error handling
console.log('\n=== Example 4: Error Handling ===');

const maybeError$ = from(() => {
  if (Math.random() > 0.5) {
    throw new Error('Random error occurred!');
  }
  return 'Successful result';
});

const unsub7 = maybeError$(
  (data: string) => console.log('Success:', data),
  (err: unknown) => console.log('Caught error:', err instanceof Error ? err.message : String(err)),
  () => console.log('Stream completed')
);

// Example 5: Complex async operations
console.log('\n=== Example 5: Complex Async Operations ===');

interface User {
  id: number;
  name: string;
  age: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
}

// Simulate API call
const fetchUser$ = fromPromise<User>(() => {
  console.log('Starting to fetch user info...');
  return new Promise<User>((resolve) => {
    setTimeout(() => {
      resolve({id: 1, name: 'John Doe', age: 25});
    }, 500);
  });
});

// Simulate fetching user posts
const fetchPosts$ = (userId: number) =>
  fromPromise<Post[]>(() => {
    console.log(`Starting to fetch posts for user ${userId}...`);
    return new Promise<Post[]>((resolve) => {
      setTimeout(() => {
        resolve([
          {id: 1, title: 'First Article', content: 'Content 1'},
          {id: 2, title: 'Second Article', content: 'Content 2'},
        ]);
      }, 300);
    });
  });

// Demonstrate sequential async operations
setTimeout(() => {
  const unsub8 = fetchUser$(
    (user: User) => {
      console.log('Fetched user:', user);
      // Fetch user posts
      const unsub9 = fetchPosts$(user.id)(
        (posts: Post[]) => console.log('User posts:', posts),
        (error: unknown) => console.error('Failed to fetch posts:', error)
      );
    },
    (error: unknown) => console.error('Failed to fetch user:', error)
  );
}, 600);

// Cleanup function example
console.log('\n=== Cleanup Function Example ===');
setTimeout(() => {
  console.log('Starting to cleanup subscriptions...');
  // Cancel all subscriptions
  [unsub1, unsub2, unsub3, unsub4].forEach((unsub) => {
    if (typeof unsub === 'function') {
      unsub();
    }
  });
  console.log('All subscriptions cleaned up');
}, 2000);
