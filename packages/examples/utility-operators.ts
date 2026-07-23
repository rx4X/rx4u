// Utility operators examples
import {fromPromise, of, pipeFrom, map, filter, take, skip, debounceTime, distinctUntilChanged, startWith, endWith, throttleTime, Sub} from 'rx4u';

console.log('=== Utility Operators Examples ===\n');

// Example 1: take operator - take only first N values
console.log('1. take operator - take only first N values:');

const numbers$ = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// Take only first 3 numbers
const firstThree$ = pipeFrom(numbers$, take(3));

const unsub1 = firstThree$(
  (num) => console.log('First 3 numbers:', num),
  (error) => console.error('Error:', error),
  () => console.log('take completed')
);

// Example 2: skip operator - skip first N values
setTimeout(() => {
  console.log('\n2. skip operator - skip first N values:');

  // Skip first 3 numbers
  const skipFirst$ = pipeFrom(of(1, 2, 3, 4, 5, 6, 7, 8), skip(3));

  const unsub2 = skipFirst$(
    (num) => console.log('After skipping first 3:', num),
    (error) => console.error('Error:', error),
    () => console.log('skip completed')
  );
}, 200);

// Example 3: Combining take and skip
setTimeout(() => {
  console.log('\nPagination data example (skip + take):');

  const allData$ = of(...Array.from({length: 20}, (_, i) => i + 1));

  // Simulate pagination: page 2, 5 items per page
  const page2$ = pipeFrom(
    allData$,
    skip(5), // Skip first page's 5 items
    take(5) // Take page 2's 5 items
  );

  const unsub3 = page2$(
    (item) => console.log('Page 2 data:', item),
    (error) => console.error('Error:', error),
    () => console.log('Page 2 loading completed')
  );
}, 400);

// Example 4: debounceTime operator - debouncing
setTimeout(() => {
  console.log('\n3. debounceTime operator - debouncing:');

  // Simulate rapid user input
  const userInputs = ['a', 'ap', 'app', 'appl', 'apple'];
  let inputIndex = 0;

  const searchInput$ = fromPromise(() => {
    if (inputIndex < userInputs.length) {
      const input = userInputs[inputIndex++];
      console.log(`User input: "${input}"`);
      return Promise.resolve(input);
    }
    return Promise.resolve('');
  });

  // Debounce processing, only trigger search after 300ms of no input
  const debouncedSearch$ = pipeFrom(
    searchInput$,
    debounceTime(300),
    filter((query: string) => query.length > 0)
  );

  const unsub4 = debouncedSearch$((query) => console.log(`🔍 Execute search: "${query}"`));

  // Simulate continuous input
  for (let i = 0; i < userInputs.length; i++) {
    setTimeout(() => {
      searchInput$(() => {});
    }, i * 100);
  }
}, 600);

// Example 5: distinctUntilChanged operator - remove consecutive duplicate values
setTimeout(() => {
  console.log('\n4. distinctUntilChanged operator - remove consecutive duplicate values:');

  // Simulate sensor data, may have consecutive identical readings
  const sensorReadings$ = of(20, 20, 21, 21, 21, 22, 20, 20, 23);

  const uniqueReadings$ = pipeFrom(sensorReadings$, distinctUntilChanged());

  console.log('Original sensor data: 20, 20, 21, 21, 21, 22, 20, 20, 23');
  const unsub5 = uniqueReadings$((reading) => console.log('Deduplicated data:', reading));
}, 1500);

// Example 6: Object deduplication
setTimeout(() => {
  console.log('\nObject property deduplication example:');

  const userStatus$ = of({userId: 1, status: 'online'}, {userId: 1, status: 'online'}, {userId: 1, status: 'away'}, {userId: 1, status: 'away'}, {userId: 1, status: 'offline'});

  const uniqueStatus$: Sub<{userId: number; status: string}> = pipeFrom(
    userStatus$,
    distinctUntilChanged((prev: any, curr: any) => prev.status === curr.status)
  );

  const unsub6 = uniqueStatus$((userStatus: {userId: number; status: string}) => console.log(`User status change: ${userStatus.status}`));
}, 1700);

// Example 7: startWith operator - add initial value
setTimeout(() => {
  console.log('\n5. startWith operator - add initial value:');

  const apiData$ = fromPromise(() => {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve(['Data 1', 'Data 2', 'Data 3']);
      }, 300);
    });
  });

  // Add loading state as initial value
  const dataWithLoading$ = pipeFrom(apiData$, startWith('Loading...'));

  const unsub7 = dataWithLoading$((data) => console.log('Data status:', data));
}, 2000);

// Example 8: endWith operator - add ending value
setTimeout(() => {
  console.log('\n6. endWith operator - add ending value:');

  const processSteps$ = of('Step 1', 'Step 2', 'Step 3');

  const processWithCompletion$ = pipeFrom(processSteps$, endWith('Processing completed'));

  const unsub8 = processWithCompletion$((step) => console.log('Processing step:', step));
}, 2500);

// Example 9: throttleTime operator - throttling
setTimeout(() => {
  console.log('\n7. throttleTime operator - throttling:');

  // Simulate high-frequency events (like scroll, mouse move)
  let eventCount = 0;
  const highFrequencyEvents$ = fromPromise(() => {
    eventCount++;
    console.log(`High frequency event #${eventCount}`);
    return Promise.resolve(`Event${eventCount}`);
  });

  // Throttle processing, handle at most once every 500ms
  const throttledEvents$ = pipeFrom(highFrequencyEvents$, throttleTime(500));

  const unsub9 = throttledEvents$((event) => console.log(`🎯 Throttled processing: ${event}`));

  // Simulate continuous event triggering
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      highFrequencyEvents$(() => {});
    }, i * 100);
  }
}, 3000);

// Example 10: Combining multiple utility operators
setTimeout(() => {
  console.log('\n8. Combining multiple utility operators:');

  // Simulate real-time stock price data
  const stockPrices = [100, 100, 101, 101, 102, 101, 101, 103, 104, 104, 105];
  let priceIndex = 0;

  const stockPrice$ = fromPromise(() => {
    if (priceIndex < stockPrices.length) {
      const price = stockPrices[priceIndex++];
      return Promise.resolve(price);
    }
    return Promise.resolve(0);
  });

  // Complex stock data processing pipeline
  const processedStockData$ = pipeFrom(
    stockPrice$,
    startWith<any>('Initializing stock monitoring...'), // Add initial state
    skip(1), // Skip initialization message
    distinctUntilChanged(), // Remove consecutive same prices
    map((price: number) => ({
      price,
      timestamp: new Date().toLocaleTimeString(),
      change: priceIndex > 1 ? price - stockPrices[priceIndex - 2] : 0,
    })),
    filter((data: any) => data.price > 0), // Filter invalid data
    take(5), // Monitor only first 5 valid price changes
    endWith('Stock monitoring ended') // Add ending message
  );

  const unsub10 = processedStockData$(
    (data: any) => {
      if (typeof data === 'string') {
        console.log(`📊 ${data}`);
      } else {
        const changeSymbol = data.change > 0 ? '📈' : data.change < 0 ? '📉' : '➡️';
        console.log(`${changeSymbol} Stock price: $${data.price} (change: ${data.change >= 0 ? '+' : ''}${data.change}) [${data.timestamp}]`);
      }
    },
    (error) => console.error('Stock data error:', error),
    () => console.log('Stock data stream completed')
  );

  // Trigger stock price updates
  for (let i = 0; i < stockPrices.length; i++) {
    setTimeout(() => {
      stockPrice$(() => {});
    }, i * 200);
  }
}, 4500);

// Example 11: Real-world application scenario - search suggestions
setTimeout(() => {
  console.log('\n9. Real-world application scenario - search suggestions:');

  // Simulate user search input
  const searchQueries = ['', 'j', 'ja', 'jav', 'java', 'javascript', 'javascript', 'javascript tutorial'];
  let queryIndex = 0;

  const userSearch$ = fromPromise(() => {
    if (queryIndex < searchQueries.length) {
      const query = searchQueries[queryIndex++];
      console.log(`User input: "${query}"`);
      return Promise.resolve(query);
    }
    return Promise.resolve('');
  });

  // Search suggestions processing pipeline
  const searchSuggestions$: Sub<{query: string; suggestions: string[]}> = pipeFrom(
    userSearch$,
    debounceTime(200), // Debounce to avoid frequent requests
    distinctUntilChanged(), // Remove duplicate queries
    filter((query: string) => query.length >= 2), // Search only with at least 2 characters
    map((query: string) => {
      // Simulate search suggestions
      const suggestions = ['javascript', 'javascript tutorial', 'javascript examples', 'javascript framework'].filter((s) => s.includes(query));
      return {query, suggestions};
    }),
    take(3) // Show at most 3 suggestions
  );

  const unsub11 = searchSuggestions$((result) => {
    console.log(`🔍 Search suggestions for "${result.query}":`);
    result.suggestions.forEach((suggestion: string, index: number) => {
      console.log(`  ${index + 1}. ${suggestion}`);
    });
  });

  // Simulate user input
  for (let i = 0; i < searchQueries.length; i++) {
    setTimeout(() => {
      userSearch$(() => {});
    }, i * 150);
  }
}, 7000);
