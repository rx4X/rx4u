// Basic operators examples
import {fromPromise, of, pipeFrom, map, filter, share, Sub} from 'rx4u';

console.log('=== Basic Operators Examples ===\n');

// Example 1: map operator - data transformation
console.log('1. map operator - data transformation:');
const numbers$ = of(1, 2, 3, 4, 5);

// Simple numeric transformation
const doubled$ = pipeFrom(
  numbers$,
  map((x: number) => x * 2)
);

const unsub1 = doubled$((result) => console.log('Doubled:', result));

// Object transformation
setTimeout(() => {
  console.log('\nObject transformation example:');
  const users$ = of({id: 1, name: 'Alice', age: 25}, {id: 2, name: 'Bob', age: 30}, {id: 3, name: 'Charlie', age: 35});

  const userNames$ = pipeFrom(
    users$,
    map((user: any) => `${user.name} (${user.age} years old)`)
  );

  const unsub2 = userNames$((name) => console.log('User:', name));
}, 100);

// Example 2: filter operator - data filtering
setTimeout(() => {
  console.log('\n2. filter operator - data filtering:');

  // Filter even numbers
  const evenNumbers$ = pipeFrom(
    of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10),
    filter((x: number) => x % 2 === 0)
  );

  const unsub3 = evenNumbers$((num) => console.log('Even number:', num));

  // Filter objects
  setTimeout(() => {
    console.log('\nFilter adult users:');
    const adults$ = pipeFrom(
      of({name: 'Alice', age: 17}, {name: 'Bob', age: 25}, {name: 'Charlie', age: 16}, {name: 'David', age: 30}),
      filter((user: any) => user.age >= 18)
    );

    const unsub4 = adults$((user: any) => console.log('Adult user:', user.name, user.age));
  }, 100);
}, 200);

// Example 3: share operator - shared subscription
setTimeout(() => {
  console.log('\n3. share operator - shared subscription:');

  // Simulate expensive computation
  const expensiveComputation$ = fromPromise<number>(() => {
    console.log('Executing expensive computation...');
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = Math.random() * 1000;
        resolve(result);
      }, 300);
    });
  });

  console.log('\nWithout share (each subscriber triggers computation):');
  const unsub5 = expensiveComputation$((result: any) => console.log('Subscriber 1:', result));
  const unsub6 = expensiveComputation$((result: any) => console.log('Subscriber 2:', result));

  setTimeout(() => {
    console.log('\nWith share (computation executes only once):');
    const shared$ = share<number>()(expensiveComputation$);

    const unsub7 = shared$((result: any) => console.log('Shared subscriber 1:', result));
    const unsub8 = shared$((result: any) => console.log('Shared subscriber 2:', result));
    const unsub9 = shared$((result: any) => console.log('Shared subscriber 3:', result));
  }, 1000);
}, 400);

// Example 4: Combining basic operators
setTimeout(() => {
  console.log('\n4. Combining basic operators:');

  // Simulate API data
  const apiData$ = fromPromise<any[]>(() => {
    return Promise.resolve([
      {id: 1, name: 'iPhone 14', price: 999, category: 'phone'},
      {id: 2, name: 'MacBook Pro', price: 2499, category: 'laptop'},
      {id: 3, name: 'iPad Air', price: 599, category: 'tablet'},
      {id: 4, name: 'Samsung Galaxy', price: 899, category: 'phone'},
      {id: 5, name: 'Dell XPS', price: 1299, category: 'laptop'},
    ]);
  });

  // Process product data: filter phones, transform format, share results
  const processedPhones$: Sub<any[]> = pipeFrom(
    apiData$,
    map((products: any[]) => products), // Expand array
    filter((products: any[]) => products.length > 0),
    map((products: any[]) =>
      products
        .filter((p) => p.category === 'phone')
        .map((p) => ({
          name: p.name,
          formattedPrice: `$${p.price}`,
          isExpensive: p.price > 900,
        }))
    ),
    share<any[]>() // Share processed results
  );

  // Multiple components subscribe to processed data
  const unsub10 = processedPhones$((phones) => {
    console.log('Product list component received data:');
    phones.forEach((phone: any) => {
      console.log(`  - ${phone.name}: ${phone.formattedPrice} ${phone.isExpensive ? '(expensive)' : '(affordable)'}`);
    });
  });

  const unsub11 = processedPhones$((phones) => {
    const expensiveCount = phones.filter((p: any) => p.isExpensive).length;
    console.log(`Statistics component: ${phones.length} phones total, ${expensiveCount} expensive ones`);
  });
}, 2000);

// Example 5: Real-time data processing
setTimeout(() => {
  console.log('\n5. Real-time data processing example:');

  // Simulate sensor data stream
  let sensorValue = 0;
  const sensorData$ = fromPromise<any>(() => {
    sensorValue += Math.random() * 10 - 5; // Random fluctuation
    return Promise.resolve({
      timestamp: Date.now(),
      temperature: 20 + sensorValue,
      humidity: 50 + Math.random() * 20,
    });
  });

  // Process sensor data
  const processedSensorData$: Sub<any> = pipeFrom(
    sensorData$,
    map((data: any) => ({
      ...data,
      temperature: Math.round(data.temperature * 10) / 10, // Keep one decimal place
      humidity: Math.round(data.humidity),
      time: new Date(data.timestamp).toLocaleTimeString(),
    })),
    filter((data: any) => data.temperature > 15 && data.temperature < 35), // Filter abnormal values
    share<any>() // Multiple display components share data
  );

  // Temperature display component
  const unsub12 = processedSensorData$((data) => console.log(`🌡️  Temperature: ${data.temperature}°C (${data.time})`));

  // Humidity display component
  const unsub13 = processedSensorData$((data) => console.log(`💧 Humidity: ${data.humidity}% (${data.time})`));

  // Simulate multiple sensor readings
  for (let i = 1; i <= 3; i++) {
    setTimeout(() => {
      const unsub = processedSensorData$(() => {});
    }, i * 500);
  }
}, 3000);
