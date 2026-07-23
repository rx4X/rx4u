// Math operators examples
import {of, pipeFrom, map, filter, scan, reduce} from 'rx4u';

console.log('=== Math Operators Examples ===\n');

// Example 1: scan operator - accumulative calculation (emits intermediate results)
console.log('1. scan operator - accumulative calculation (emits intermediate results):');

// Basic accumulation example
const numbers$ = of(1, 2, 3, 4, 5);

const runningSum$ = pipeFrom(
  numbers$,
  scan((acc: number, curr: number) => {
    const result = acc + curr;
    console.log(`Accumulation: ${acc} + ${curr} = ${result}`);
    return result;
  }, 0) // Initial value is 0
);

const unsub1 = runningSum$(
  (sum) => console.log(`📊 Current running sum: ${sum}`),
  (error) => console.error('❌ Error:', error),
  () => console.log('🔚 Accumulation complete\n')
);

// Example 2: reduce operator - final aggregated result
setTimeout(() => {
  console.log('2. reduce operator - final aggregated result:');

  const finalSum$ = pipeFrom(
    numbers$,
    reduce((acc: number, curr: number) => {
      console.log(`Calculating: ${acc} + ${curr}`);
      return acc + curr;
    }, 0)
  );

  const unsub2 = finalSum$(
    (sum) => console.log(`🎯 Final result: ${sum}`),
    (error) => console.error('❌ Error:', error),
    () => console.log('🔚 Aggregation complete\n')
  );
}, 1000);

// Example 3: practical application of scan - real-time statistics
setTimeout(() => {
  console.log('3. practical application of scan - real-time statistics:');

  // Simulate user behavior data
  const userActions$ = of({type: 'click', value: 1}, {type: 'scroll', value: 1}, {type: 'click', value: 1}, {type: 'purchase', value: 100}, {type: 'click', value: 1}, {type: 'purchase', value: 50});

  // Real-time user behavior statistics
  const realTimeStats$ = pipeFrom(
    userActions$,
    scan(
      (stats: any, action: any) => {
        const newStats = {
          ...stats,
          totalActions: stats.totalActions + 1,
          [action.type]: (stats[action.type] || 0) + 1,
          totalValue: stats.totalValue + action.value,
        };

        console.log(`📈 User action: ${action.type} (+${action.value})`);
        return newStats;
      },
      {
        totalActions: 0,
        totalValue: 0,
        click: 0,
        scroll: 0,
        purchase: 0,
      }
    )
  );

  const unsub3 = realTimeStats$(
    (stats: any) => {
      console.log('📊 Real-time statistics:', {
        'Total Actions': stats.totalActions,
        'Click Count': stats.click,
        'Scroll Count': stats.scroll,
        'Purchase Count': stats.purchase,
        'Total Value': stats.totalValue,
      });
    },
    (error) => console.error('❌ Statistics error:', error),
    () => console.log('🔚 Real-time statistics complete\n')
  );
}, 2000);

// Example 4: practical application of reduce - data aggregation
setTimeout(() => {
  console.log('4. practical application of reduce - data aggregation:');

  // Simulate sales data
  const salesData$ = of(
    {product: 'iPhone', category: 'Electronics', amount: 999, quantity: 2},
    {product: 'MacBook', category: 'Electronics', amount: 1999, quantity: 1},
    {product: 'Coffee', category: 'Food', amount: 25, quantity: 3},
    {product: 'iPad', category: 'Electronics', amount: 599, quantity: 1},
    {product: 'Bread', category: 'Food', amount: 15, quantity: 5}
  );

  // Aggregate sales data by category
  const salesSummary$ = pipeFrom(
    salesData$,
    reduce((summary: any, sale: any) => {
      const category = sale.category;

      if (!summary[category]) {
        summary[category] = {
          totalAmount: 0,
          totalQuantity: 0,
          products: [],
        };
      }

      summary[category].totalAmount += sale.amount * sale.quantity;
      summary[category].totalQuantity += sale.quantity;
      summary[category].products.push(sale.product);

      console.log(`💰 Processing sale: ${sale.product} x${sale.quantity} = $${sale.amount * sale.quantity}`);

      return summary;
    }, {})
  );

  const unsub4 = salesSummary$(
    (summary: any) => {
      console.log('📋 Sales Summary:');
      Object.entries(summary).forEach(([category, data]: [string, any]) => {
        console.log(`  ${category}:`);
        console.log(`    Total Amount: $${data.totalAmount}`);
        console.log(`    Total Quantity: ${data.totalQuantity}`);
        console.log(`    Products: ${data.products.join(', ')}`);
      });
    },
    (error) => console.error('❌ Aggregation error:', error),
    () => console.log('🔚 Sales summary complete\n')
  );
}, 4000);

// Example 5: comparison between scan and reduce
setTimeout(() => {
  console.log('5. comparison between scan and reduce:');

  const values$ = of(10, 20, 30, 40, 50);

  console.log('--- Scan results (each intermediate value) ---');
  const scanResult$ = pipeFrom(
    values$,
    scan((acc: number, curr: number) => acc + curr, 0)
  );

  const unsub5 = scanResult$(
    (value) => console.log(`Scan output: ${value}`),
    (error) => console.error('❌ Scan error:', error),
    () => {
      console.log('Scan complete\n');

      // Delayed execution of reduce example
      setTimeout(() => {
        console.log('--- Reduce results (final value only) ---');
        const reduceResult$ = pipeFrom(
          values$,
          reduce((acc: number, curr: number) => acc + curr, 0)
        );

        const unsub6 = reduceResult$(
          (value) => console.log(`Reduce output: ${value}`),
          (error) => console.error('❌ Reduce error:', error),
          () => console.log('Reduce complete\n')
        );
      }, 500);
    }
  );
}, 6000);

// Example 6: complex accumulative calculation - moving average
setTimeout(() => {
  console.log('6. complex accumulative calculation - moving average:');

  // Simulate stock price data
  const stockPrices$ = of(100, 102, 98, 105, 103, 107, 101, 99, 104, 106);

  // Calculate moving average (window size of 3)
  const movingAverage$ = pipeFrom(
    stockPrices$,
    scan((window: number[], price: number) => {
      const newWindow = [...window, price];
      // Keep window size at 3
      if (newWindow.length > 3) {
        newWindow.shift();
      }
      return newWindow;
    }, [] as number[]),
    filter((window: number[]) => window.length === 3), // Only calculate when window is full
    map((window: number[]) => {
      const average = window.reduce((sum, price) => sum + price, 0) / window.length;
      return {
        window: [...window],
        average: Math.round(average * 100) / 100,
      };
    })
  );

  const unsub7 = movingAverage$(
    (result: any) => {
      console.log(`📈 Price window: [${result.window.join(', ')}] → Moving average: ${result.average}`);
    },
    (error) => console.error('❌ Moving average error:', error),
    () => console.log('🔚 Moving average calculation complete\n')
  );
}, 8000);

// Example 7: state machine pattern - using scan
setTimeout(() => {
  console.log('7. state machine pattern - using scan:');

  // Simulate user state change events
  const userEvents$ = of(
    {type: 'LOGIN', userId: 'user123'},
    {type: 'VIEW_PRODUCT', productId: 'prod456'},
    {type: 'ADD_TO_CART', productId: 'prod456', quantity: 2},
    {type: 'VIEW_PRODUCT', productId: 'prod789'},
    {type: 'ADD_TO_CART', productId: 'prod789', quantity: 1},
    {type: 'CHECKOUT'},
    {type: 'LOGOUT'}
  );

  // Use scan to maintain user session state
  const userSession$ = pipeFrom(
    userEvents$,
    scan(
      (session: any, event: any) => {
        console.log(`🎯 Processing event: ${event.type}`);

        switch (event.type) {
          case 'LOGIN':
            return {
              ...session,
              isLoggedIn: true,
              userId: event.userId,
              loginTime: Date.now(),
            };

          case 'VIEW_PRODUCT':
            return {
              ...session,
              viewedProducts: [...(session.viewedProducts || []), event.productId],
              lastActivity: Date.now(),
            };

          case 'ADD_TO_CART':
            const existingItem = session.cart?.find((item: any) => item.productId === event.productId);
            let newCart;

            if (existingItem) {
              newCart = session.cart.map((item: any) => (item.productId === event.productId ? {...item, quantity: item.quantity + event.quantity} : item));
            } else {
              newCart = [
                ...(session.cart || []),
                {
                  productId: event.productId,
                  quantity: event.quantity,
                },
              ];
            }

            return {
              ...session,
              cart: newCart,
              lastActivity: Date.now(),
            };

          case 'CHECKOUT':
            return {
              ...session,
              orders: [
                ...(session.orders || []),
                {
                  orderId: `order_${Date.now()}`,
                  items: session.cart,
                  orderTime: Date.now(),
                },
              ],
              cart: [],
              lastActivity: Date.now(),
            };

          case 'LOGOUT':
            return {
              isLoggedIn: false,
              userId: null,
              logoutTime: Date.now(),
              // Keep some session data for analysis
              sessionDuration: Date.now() - session.loginTime,
              viewedProducts: session.viewedProducts,
              orders: session.orders,
            };

          default:
            return session;
        }
      },
      {
        isLoggedIn: false,
        userId: null,
        cart: [],
        viewedProducts: [],
        orders: [],
      }
    )
  );

  const unsub8 = userSession$(
    (session: any) => {
      console.log('👤 User session state:');
      console.log(`  Login status: ${session.isLoggedIn ? 'Logged in' : 'Not logged in'}`);
      if (session.userId) console.log(`  User ID: ${session.userId}`);
      if (session.cart?.length > 0) {
        console.log(`  Shopping cart: ${session.cart.length} items`);
      }
      if (session.viewedProducts?.length > 0) {
        console.log(`  Viewed products: ${session.viewedProducts.length} items`);
      }
      if (session.orders?.length > 0) {
        console.log(`  Order count: ${session.orders.length}`);
      }
      if (session.sessionDuration) {
        console.log(`  Session duration: ${Math.round(session.sessionDuration / 1000)} seconds`);
      }
      console.log('');
    },
    (error) => console.error('❌ Session state error:', error),
    () => console.log('🔚 User session tracking complete\n')
  );
}, 10000);

// Example 8: performance monitoring - using reduce to calculate statistics
setTimeout(() => {
  console.log('8. performance monitoring - using reduce to calculate statistics:');

  // Simulate API response time data
  const apiResponseTimes$ = of(
    {endpoint: '/api/users', responseTime: 120},
    {endpoint: '/api/products', responseTime: 85},
    {endpoint: '/api/users', responseTime: 95},
    {endpoint: '/api/orders', responseTime: 200},
    {endpoint: '/api/products', responseTime: 110},
    {endpoint: '/api/users', responseTime: 105},
    {endpoint: '/api/orders', responseTime: 180},
    {endpoint: '/api/products', responseTime: 90}
  );

  // Calculate performance statistics
  const performanceStats$ = pipeFrom(
    apiResponseTimes$,
    reduce((stats: any, response: any) => {
      const endpoint = response.endpoint;

      if (!stats[endpoint]) {
        stats[endpoint] = {
          count: 0,
          totalTime: 0,
          minTime: Infinity,
          maxTime: 0,
          times: [],
        };
      }

      const endpointStats = stats[endpoint];
      endpointStats.count++;
      endpointStats.totalTime += response.responseTime;
      endpointStats.minTime = Math.min(endpointStats.minTime, response.responseTime);
      endpointStats.maxTime = Math.max(endpointStats.maxTime, response.responseTime);
      endpointStats.times.push(response.responseTime);

      console.log(`⏱️  ${endpoint}: ${response.responseTime}ms`);

      return stats;
    }, {}),
    map((stats: any) => {
      // Calculate average response time and median for each endpoint
      const processedStats = {} as any;

      Object.entries(stats).forEach(([endpoint, data]: [string, any]) => {
        const sortedTimes = [...data.times].sort((a, b) => a - b);
        const median = sortedTimes.length % 2 === 0 ? (sortedTimes[sortedTimes.length / 2 - 1] + sortedTimes[sortedTimes.length / 2]) / 2 : sortedTimes[Math.floor(sortedTimes.length / 2)];

        processedStats[endpoint] = {
          count: data.count,
          avgTime: Math.round(data.totalTime / data.count),
          minTime: data.minTime,
          maxTime: data.maxTime,
          medianTime: Math.round(median),
        };
      });

      return processedStats;
    })
  );

  const unsub9 = performanceStats$(
    (stats: any) => {
      console.log('\n📊 API Performance Statistics Report:');
      Object.entries(stats).forEach(([endpoint, data]: [string, any]) => {
        console.log(`\n${endpoint}:`);
        console.log(`  Request count: ${data.count}`);
        console.log(`  Average response time: ${data.avgTime}ms`);
        console.log(`  Fastest response time: ${data.minTime}ms`);
        console.log(`  Slowest response time: ${data.maxTime}ms`);
        console.log(`  Median response time: ${data.medianTime}ms`);
      });
    },
    (error) => console.error('❌ Performance statistics error:', error),
    () => console.log('\n🔚 Performance monitoring complete')
  );
}, 13000);
