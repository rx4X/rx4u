// Simplified API Demo
import {from, of, pipeFrom, map, filter, share, fromPromise} from 'rx4u';

console.log('=== rx4u Simplified API Demo ===\n');

// 1. Basic usage - sub returns unsubscribe function
console.log('1. Basic usage:');
const data$ = fromPromise<number>(() => Promise.resolve(42));
const unsub = data$((data: number) => console.log('Received data:', data));

// Unsubscribing is simple - just call the function
setTimeout(() => {
  unsub(); // No need for .unsubscribe() anymore
  console.log('Unsubscribed\n');
}, 100);

// 2. Pipeline operations
setTimeout(() => {
  console.log('2. Pipeline operations:');
  const pipeline$ = pipeFrom(
    of(1, 2, 3, 4, 5),
    filter((x: number) => x % 2 === 0),
    map((x: number) => x * x)
  );

  const unsub2 = pipeline$((result: number) => console.log('Processing result:', result));
}, 200);

// 3. Shared subscriptions
setTimeout(() => {
  console.log('\n3. Shared subscriptions:');
  const source$ = from(() => {
    const value = Math.random();
    console.log('Generating random number:', value);
    return value;
  });

  const shared$ = share<number>()(source$);

  // Multiple subscribers share the same source
  const unsub3 = shared$((data: number) => console.log('Subscriber 1:', data));
  const unsub4 = shared$((data: number) => console.log('Subscriber 2:', data));

  // Demonstrate unsubscription
  setTimeout(() => {
    console.log('Canceling all subscriptions...');
    unsub3(); // Simple function call
    unsub4(); // Simple function call
  }, 100);
}, 400);

// 4. Error handling
setTimeout(() => {
  console.log('\n4. Error handling:');
  const errorSource$ = from(() => {
    if (Math.random() > 0.5) {
      throw new Error('Random error');
    }
    return 'Success';
  });

  const unsub5 = errorSource$(
    (data: string) => console.log('Success:', data),
    (error: unknown) => console.log('Error:', error instanceof Error ? error.message : String(error)),
    () => console.log('Complete')
  );
}, 600);

console.log('\nNote: sub() now directly returns unsubscribe function, no longer returns an object!');
