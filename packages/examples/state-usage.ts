import {createState, createLazyState} from 'rx4u';

// ============================================
// Example 1: Basic createState usage
// ============================================

// Create a counter state
const [count$, setCount, getCount, destroyCount] = createState<number>(0);

// Subscribe to state changes
const unsubCount = count$(
  (value: number) => {
    console.log('Count changed to:', value);
  },
  (error: unknown) => {
    console.error('Error:', error);
  },
  () => {
    console.log('Count state completed');
  }
);

// Get current value
console.log('Current count:', getCount()); // Output: Current count: 0

// Update state
setCount(1);
console.log('Current count:', getCount()); // Output: Current count: 1

setCount((prev = 0) => prev + 1);
console.log('Current count:', getCount()); // Output: Current count: 2

// ============================================
// Example 2: User state with functional updates
// ============================================

interface User {
  id: number;
  name: string;
  email: string;
}

const [user$, setUser, getUser, destroyUser] = createState<User | null>(null);

// Subscribe to user state
const unsubUser = user$((user: User | null) => {
  if (user) {
    console.log('User logged in:', user.name);
  } else {
    console.log('User logged out');
  }
});

// Simulate user login
setUser({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
});

// Simulate user logout using functional update
setUser(() => null);

// ============================================
// Example 3: createLazyState - no initial value
// ============================================

console.log('\n--- Lazy State Example ---');

const [lazyState$, setLazy, getLazy, destroyLazy] = createLazyState<string>();

// No value yet - subscriber won't receive anything immediately
const unsubLazy = lazyState$((value: string) => {
  console.log('Lazy state value:', value);
});

console.log('Lazy state before setValue:', getLazy()); // undefined

// Set a value - now subscribers receive it
setLazy('Hello from lazy state!');
console.log('Lazy state after setValue:', getLazy());

// ============================================
// Example 4: Cleanup with destroy
// ============================================

console.log('\n--- Cleanup Example ---');

const [tempState$, setTemp, getTemp, destroyTemp] = createState(0);

const unsubTemp = tempState$((value: number) => {
  console.log('Temp state:', value);
});

setTemp(100);

// Destroy the state - clears all subscribers
destroyTemp();

// After destroy, setValue does nothing
setTemp(200); // No output

// Clean up
unsubCount();
unsubUser();
unsubLazy();
destroyCount();
destroyUser();
destroyLazy();
