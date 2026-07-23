// Advanced usage examples
import {fromPromise, of, interval, pipeFrom, Sub, map, filter, share, take, merge, combineLatest, zip} from 'rx4u';

// Example 1: Combining multiple data streams
console.log('=== Example 1: Data Stream Combination ===');

const source1$ = of(1, 2, 3);
const source2$ = of('a', 'b', 'c');
const source3$ = of(true, false, true);

// merge - merge all values
console.log('Merge results:');
const merged$: Sub<string> = merge(map((x: number) => `Number: ${x}`)(source1$), map((x: string) => `Letter: ${x}`)(source2$), map((x: boolean) => `Boolean: ${x}`)(source3$));

const unsub1 = merged$((result: string) => console.log(result));

// combineLatest - combine latest values
setTimeout(() => {
  console.log('\nCombineLatest results:');
  const combined$: Sub<any> = combineLatest(source1$, source2$);
  const unsub2 = combined$((result) => console.log('Combined:', result));
}, 100);

// zip - pair by index
setTimeout(() => {
  console.log('\nZip results:');
  const zipped$: Sub<any> = zip(source1$, source2$);
  const unsub3 = zipped$((result) => console.log('Paired:', result));
}, 200);

// Example 2: Real-time data processing
console.log('\n=== Example 2: Real-time Data Processing ===');

// Simulate sensor data
const sensorData$ = interval(500);

const processedSensorData$ = pipeFrom(
  sensorData$,
  map((tick: number) => ({
    timestamp: Date.now(),
    temperature: 20 + Math.random() * 10, // 20-30°C
    humidity: 40 + Math.random() * 20, // 40-60%
    tick,
  })),
  filter((data: any) => data.temperature < 28), // Only focus on data with temperature below 28°C
  take(5) // Only take first 5 data points
);

setTimeout(() => {
  console.log('Starting sensor data monitoring...');
  const unsub4 = processedSensorData$(
    (data: any) => console.log(`Time: ${new Date(data.timestamp).toLocaleTimeString()}, Temperature: ${data.temperature.toFixed(1)}°C, Humidity: ${data.humidity.toFixed(1)}%`),
    (error) => console.error('Sensor error:', error),
    () => console.log('Sensor monitoring completed')
  );
}, 300);

// Example 3: User interaction handling
console.log('\n=== Example 3: Simulated User Interaction ===');

// Simulate user click events
const userClicks$: Sub<any> = fromPromise<any[]>(() => {
  return new Promise((resolve) => {
    const clicks = Array.from({length: 10}, (_, i) => ({
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100),
      timestamp: Date.now() + i * 100,
    }));
    resolve(clicks);
  });
});

// Process click data
const processedClicks$ = pipeFrom(
  userClicks$,
  map((clicks: any[]) => clicks), // Expand click array
  filter((clicks: any[]) => clicks.length > 0),
  map((clicks: any[]) => {
    // Calculate click hotspot area
    const avgX = clicks.reduce((sum, click) => sum + click.x, 0) / clicks.length;
    const avgY = clicks.reduce((sum, click) => sum + click.y, 0) / clicks.length;
    return {
      hotspot: {x: avgX, y: avgY},
      clickCount: clicks.length,
      timeSpan: clicks[clicks.length - 1].timestamp - clicks[0].timestamp,
    };
  })
);

setTimeout(() => {
  const unsub5 = processedClicks$((data: any) =>
    console.log(`Click hotspot: (${data.hotspot.x.toFixed(1)}, ${data.hotspot.y.toFixed(1)}), Click count: ${data.clickCount}, Time span: ${data.timeSpan}ms`)
  );
}, 1000);

// Example 4: Caching and sharing
console.log('\n=== Example 4: Caching and Sharing ===');

// Simulate expensive API call
const expensiveAPI$ = fromPromise<any>(() => {
  console.log('Executing expensive API call...');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: 'Important data',
        timestamp: Date.now(),
        cost: 'Very expensive',
      });
    }, 500);
  });
});

// Use share to cache results
const cachedAPI$ = share<any>()(expensiveAPI$);

setTimeout(() => {
  console.log('Multiple components requesting data simultaneously:');

  // Component 1
  const unsub6 = cachedAPI$((data: any) => console.log('Component 1 received:', data));

  // Component 2
  const unsub7 = cachedAPI$((data: any) => console.log('Component 2 received:', data));

  // Component 3
  const unsub8 = cachedAPI$((data: any) => console.log('Component 3 received:', data));
}, 1500);

// Example 5: Error recovery and retry
console.log('\n=== Example 5: Error Handling and Recovery ===');

let attemptCount = 0;
const unreliableService$ = fromPromise<string>(() => {
  attemptCount++;
  console.log(`Attempting service call #${attemptCount}...`);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (attemptCount < 3) {
        reject(new Error(`Service temporarily unavailable (attempt ${attemptCount})`));
      } else {
        resolve('Service call successful!');
      }
    }, 200);
  });
});

// Simple retry logic
const retryService = (maxRetries: number) => {
  let retries = 0;

  const attempt = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const unsub = unreliableService$(
        (data: any) => resolve(data),
        (error: any) => {
          retries++;
          if (retries < maxRetries) {
            console.log(`Retry ${retries}/${maxRetries}...`);
            setTimeout(() => {
              attempt().then(resolve).catch(reject);
            }, 300);
          } else {
            reject(new Error(`Service failed after ${maxRetries} retries`));
          }
        }
      );
    });
  };

  return attempt();
};

setTimeout(() => {
  console.log('Starting unreliable service call...');
  retryService(5)
    .then((result) => console.log('Final success:', result))
    .catch((error) => console.error('Final failure:', error.message));
}, 2500);
