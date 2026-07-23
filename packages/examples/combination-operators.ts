// Combination operators examples
import {from, of, pipeFrom, map, take, merge, combineLatest, zip, Sub} from 'rx4u';

console.log('=== Combination Operators Examples ===\n');

// Example 1: merge operator - merging multiple streams
console.log('1. merge operator - merging multiple streams:');

// Simulate different event sources
const userClicks$ = of('Click Event 1', 'Click Event 2', 'Click Event 3');
const keyboardEvents$ = of('Key Event A', 'Key Event B');
const mouseEvents$ = of('Mouse Move 1', 'Mouse Move 2');

// Merge all events
const allEvents$ = merge(
  pipeFrom(
    userClicks$,
    map((event: string) => `🖱️  ${event}`)
  ),
  pipeFrom(
    keyboardEvents$,
    map((event: string) => `⌨️  ${event}`)
  ),
  pipeFrom(
    mouseEvents$,
    map((event: string) => `🖱️  ${event}`)
  )
);

const unsub1 = allEvents$((event: any) => console.log('Event:', event));

// Example 2: Real-time data merging
setTimeout(() => {
  console.log('\nReal-time data merging example:');

  // Simulate different sensor data
  const temperatureSensor$ = from(() => {
    return Promise.resolve({
      type: 'temperature',
      value: 20 + Math.random() * 10,
      timestamp: Date.now(),
    });
  });

  const humiditySensor$ = from(() => {
    return Promise.resolve({
      type: 'humidity',
      value: 40 + Math.random() * 20,
      timestamp: Date.now(),
    });
  });

  const pressureSensor$ = from(() => {
    return Promise.resolve({
      type: 'pressure',
      value: 1000 + Math.random() * 50,
      timestamp: Date.now(),
    });
  });

  // Merge all sensor data
  const allSensorData$ = merge(temperatureSensor$, humiditySensor$, pressureSensor$);

  const unsub2 = allSensorData$((data: any) => console.log(`Sensor [${data.type}]: ${data.value.toFixed(1)} (${new Date(data.timestamp).toLocaleTimeString()})`));
}, 200);

// Example 3: combineLatest operator - combining latest values
setTimeout(() => {
  console.log('\n2. combineLatest operator - combining latest values:');

  // Simulate user settings
  const theme$ = of('light', 'dark', 'auto');
  const language$ = of('zh', 'en', 'fr');
  const fontSize$ = of(12, 14, 16, 18);

  // Combine user settings
  const userSettings$ = combineLatest(theme$, language$, fontSize$);

  const unsub3 = userSettings$(([theme, language, fontSize]: any) => {
    console.log(`User settings: theme=${theme}, language=${language}, fontSize=${fontSize}px`);
  });
}, 400);

// Example 4: Form validation scenario
setTimeout(() => {
  console.log('\nForm validation scenario:');

  // Simulate form fields
  const username$ = of('', 'user', 'username123');
  const email$ = of('', 'invalid', 'user@example.com');
  const password$ = of('', '123', 'securePassword123');

  // Validation functions
  const validateUsername = (username: string) => username.length >= 3;
  const validateEmail = (email: string) => email.includes('@') && email.includes('.');
  const validatePassword = (password: string) => password.length >= 8;

  // Combine validation results
  const formValidation$ = combineLatest(pipeFrom(username$, map(validateUsername)), pipeFrom(email$, map(validateEmail)), pipeFrom(password$, map(validatePassword)));

  const unsub4 = formValidation$(([usernameValid, emailValid, passwordValid]: any) => {
    const isFormValid = usernameValid && emailValid && passwordValid;
    console.log(`Form validation: username=${usernameValid ? '✅' : '❌'}, email=${emailValid ? '✅' : '❌'}, password=${passwordValid ? '✅' : '❌'} | overall=${isFormValid ? 'valid' : 'invalid'}`);
  });
}, 600);

// Example 5: zip operator - pairing by index
setTimeout(() => {
  console.log('\n3. zip operator - pairing by index:');

  // Simulate parallel async operations
  const userIds$ = of(1, 2, 3, 4);
  const userNames$ = of('Alice', 'Bob', 'Charlie', 'David');
  const userAges$ = of(25, 30, 35, 28);

  // Pair user data by index
  const users$ = zip(userIds$, userNames$, userAges$);

  const unsub5 = users$(([id, name, age]: any) => {
    console.log(`User: ID=${id}, name=${name}, age=${age}`);
  });
}, 800);

// Example 6: API data pairing
setTimeout(() => {
  console.log('\n API data pairing example:');

  // Simulate parallel API calls
  const fetchUserProfile$ = from(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({id: 1, name: 'John Doe', email: 'john@example.com'});
      }, 100);
    });
  });

  const fetchUserPreferences$ = from(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({theme: 'dark', notifications: true, language: 'en'});
      }, 150);
    });
  });

  const fetchUserStats$ = from(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({loginCount: 42, lastLogin: '2024-01-15'});
      }, 80);
    });
  });

  // Pair all user data
  const completeUserData$ = zip(fetchUserProfile$, fetchUserPreferences$, fetchUserStats$);

  const unsub6 = completeUserData$(([profile, preferences, stats]: any) => {
    console.log('Complete user data:');
    console.log('  Profile:', profile);
    console.log('  Preferences:', preferences);
    console.log('  Statistics:', stats);
  });
}, 1000);

// Example 7: Complex stream combinations
setTimeout(() => {
  console.log('\n4. Complex stream combinations:');

  // Simulate real-time stock data
  const stockPrices$ = of({symbol: 'AAPL', price: 150.25}, {symbol: 'GOOGL', price: 2800.5}, {symbol: 'MSFT', price: 300.75});

  // Simulate market indices
  const marketIndex$ = of({name: 'S&P 500', value: 4200}, {name: 'NASDAQ', value: 13500}, {name: 'DOW', value: 34000});

  // Simulate news events
  const newsEvents$ = of({type: 'earnings', impact: 'positive'}, {type: 'policy', impact: 'neutral'}, {type: 'merger', impact: 'positive'});

  // Use different combination strategies
  console.log('\nMerge all financial data (merge):');
  const allFinancialData$: Sub<any> = merge(
    pipeFrom(
      stockPrices$,
      map((data: any) => ({...data, type: 'stock'}))
    ),
    pipeFrom(
      marketIndex$,
      map((data: any) => ({...data, type: 'index'}))
    ),
    pipeFrom(
      newsEvents$,
      map((data: any) => ({...data, type: 'news'}))
    )
  );

  const unsub7 = allFinancialData$((data) => console.log(`📊 [${data.type.toUpperCase()}]:`, data));

  setTimeout(() => {
    console.log('\nCombine latest market state (combineLatest):');
    const marketState$ = combineLatest(
      pipeFrom(stockPrices$, take(1)), // Take only first stock
      pipeFrom(marketIndex$, take(1)), // Take only first index
      pipeFrom(newsEvents$, take(1)) // Take only first news
    );

    const unsub8 = marketState$(([stock, index, news]: any) => {
      console.log('Market snapshot:');
      console.log(`  Stock: ${stock.symbol} - $${stock.price}`);
      console.log(`  Index: ${index.name} - ${index.value}`);
      console.log(`  News: ${news.type} (${news.impact})`);
    });
  }, 200);

  setTimeout(() => {
    console.log('\nPair analysis data (zip):');
    const analysisData$ = zip(pipeFrom(stockPrices$, take(2)), pipeFrom(newsEvents$, take(2)));

    const unsub9 = analysisData$(([stock, news]: any) => {
      console.log(`Analysis: ${stock.symbol} ($${stock.price}) affected by ${news.type} event (${news.impact})`);
    });
  }, 400);
}, 1500);
