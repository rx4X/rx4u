// Transformation operators examples
import {fromPromise, of, pipeFrom, map, switchMap, mergeMap, concatMap} from 'rx4u';

console.log('=== Transformation Operators Examples ===\n');

// Example 1: switchMap operator - switch to new inner stream
console.log('1. switchMap operator - switch to new inner stream:');

// Simulate user search, each new search cancels previous search
const searchQueries$ = of('js', 'javascript', 'typescript');

// Simulate search API
const searchAPI = (query: string) => {
  console.log(`🔍 Starting search: "${query}"`);
  return fromPromise<string[]>(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = [`${query} tutorial`, `${query} examples`, `${query} best practices`];
        console.log(`✅ Search "${query}" completed`);
        resolve(results);
      }, query.length * 100); // Search time related to query length
    });
  });
};

// Using switchMap, new search cancels previous search
const switchMapSearch$ = pipeFrom(
  searchQueries$,
  switchMap((query: string) => searchAPI(query))
);

const unsub1 = switchMapSearch$((results) => {
  console.log('SwitchMap search results:');
  (results as string[]).forEach((result, index) => {
    console.log(`  ${index + 1}. ${result}`);
  });
});

// Example 2: mergeMap operator - concurrent processing of multiple inner streams
setTimeout(() => {
  console.log('\n2. mergeMap operator - concurrent processing of multiple inner streams:');

  const userIds$ = of(1, 2, 3);

  // Simulate get user details API
  const fetchUserDetails = (userId: number) => {
    console.log(`📡 Getting user ${userId} details`);
    return fromPromise(() => {
      return new Promise((resolve) => {
        setTimeout(
          () => {
            const user = {
              id: userId,
              name: `User${userId}`,
              email: `user${userId}@example.com`,
              age: 20 + userId * 5,
            };
            console.log(`✅ User ${userId} details retrieved`);
            resolve(user);
          },
          Math.random() * 300 + 100
        ); // Random delay
      });
    });
  };

  // Using mergeMap, all requests execute concurrently
  const mergeMapUsers$ = pipeFrom(
    userIds$,
    mergeMap((userId: number) => fetchUserDetails(userId))
  );

  const unsub2 = mergeMapUsers$((user) => console.log('MergeMap user details:', user));
}, 1000);

// Example 3: concatMap operator - sequential processing of inner streams
setTimeout(() => {
  console.log('\n3. concatMap operator - sequential processing of inner streams:');

  const taskIds$ = of('TaskA', 'TaskB', 'TaskC');

  // Simulate task execution API
  const executeTask = (taskId: string) => {
    console.log(`⚙️  Starting execution: ${taskId}`);
    return fromPromise(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const result = `${taskId} execution result`;
          console.log(`✅ ${taskId} execution completed`);
          resolve(result);
        }, 300);
      });
    });
  };

  // Using concatMap, tasks execute sequentially
  const concatMapTasks$ = pipeFrom(
    taskIds$,
    concatMap((taskId: string) => executeTask(taskId))
  );

  const unsub3 = concatMapTasks$((result) => console.log('ConcatMap task result:', result));
}, 2000);

// Example 4: Comparison demonstration of three operators
setTimeout(() => {
  console.log('\n4. Comparison demonstration of three operators:');

  const requests$ = of('Request1', 'Request2', 'Request3');

  // Simulate network request
  const makeRequest = (requestName: string) => {
    const delay = requestName === 'Request2' ? 500 : 200; // Request2 intentionally delayed
    console.log(`🌐 Making ${requestName} (estimated ${delay}ms)`);

    return fromPromise(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const response = `${requestName} response`;
          console.log(`📨 ${requestName} response returned`);
          resolve(response);
        }, delay);
      });
    });
  };

  console.log('\n--- SwitchMap Demo (new request cancels old request) ---');
  const switchMapDemo$ = pipeFrom(
    requests$,
    switchMap((req: string) => makeRequest(`Switch-${req}`))
  );

  const unsub4 = switchMapDemo$((response) => console.log('🔄 SwitchMap:', response));

  setTimeout(() => {
    console.log('\n--- MergeMap Demo (concurrent execution of all requests) ---');
    const mergeMapDemo$ = pipeFrom(
      requests$,
      mergeMap((req: string) => makeRequest(`Merge-${req}`))
    );

    const unsub5 = mergeMapDemo$((response) => console.log('🔀 MergeMap:', response));
  }, 1000);

  setTimeout(() => {
    console.log('\n--- ConcatMap Demo (sequential execution of requests) ---');
    const concatMapDemo$ = pipeFrom(
      requests$,
      concatMap((req: string) => makeRequest(`Concat-${req}`))
    );

    const unsub6 = concatMapDemo$((response) => console.log('➡️  ConcatMap:', response));
  }, 2500);
}, 3500);

// Example 5: Real application scenario - file upload
setTimeout(() => {
  console.log('\n5. Real application scenario - file upload:');

  const files$ = of({name: 'document.pdf', size: 1024}, {name: 'image.jpg', size: 2048}, {name: 'video.mp4', size: 5120});

  // Simulate file upload
  const uploadFile = (file: any) => {
    console.log(`📤 Starting upload: ${file.name} (${file.size}KB)`);
    return fromPromise(() => {
      return new Promise((resolve, reject) => {
        const uploadTime = (file.size / 1024) * 200; // Calculate upload time based on file size

        setTimeout(() => {
          if (Math.random() > 0.1) {
            // 90% success rate
            console.log(`✅ ${file.name} upload successful`);
            resolve({
              fileName: file.name,
              url: `https://cdn.example.com/${file.name}`,
              uploadTime: uploadTime,
            });
          } else {
            console.log(`❌ ${file.name} upload failed`);
            reject(new Error(`${file.name} upload failed`));
          }
        }, uploadTime);
      });
    });
  };

  console.log('\nScenario 1: Concurrent upload (mergeMap) - suitable for independent files:');
  const concurrentUpload$ = pipeFrom(
    files$,
    mergeMap((file: any) => uploadFile(file))
  );

  const unsub7 = concurrentUpload$(
    (result) => console.log('📁 Concurrent upload result:', result),
    (error) => console.error('❌ Concurrent upload error:', error instanceof Error ? error.message : String(error))
  );

  setTimeout(() => {
    console.log('\nScenario 2: Sequential upload (concatMap) - suitable for dependent files:');
    const sequentialUpload$ = pipeFrom(
      files$,
      concatMap((file: any) => uploadFile(file))
    );

    const unsub8 = sequentialUpload$(
      (result) => console.log('📋 Sequential upload result:', result),
      (error) => console.error('❌ Sequential upload error:', error instanceof Error ? error.message : String(error))
    );
  }, 2000);
}, 7000);

// Example 6: complex data processing pipeline
setTimeout(() => {
  console.log('\n6. complex data processing pipeline:');

  // Simulate user action flow
  const userActions$ = of({type: 'login', userId: 1}, {type: 'view_product', productId: 101}, {type: 'add_to_cart', productId: 101, quantity: 2}, {type: 'checkout', cartId: 'cart_123'});

  // Simulate different API calls
  const processAction = (action: any) => {
    console.log(`🎯 Processing user action: ${action.type}`);

    switch (action.type) {
      case 'login':
        return fromPromise(() =>
          Promise.resolve({
            action: action.type,
            result: `User ${action.userId} login successful`,
            timestamp: Date.now(),
          })
        );

      case 'view_product':
        return fromPromise(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                action: action.type,
                result: `Product ${action.productId} view record saved`,
                timestamp: Date.now(),
              });
            }, 100);
          });
        });

      case 'add_to_cart':
        return fromPromise(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                action: action.type,
                result: `Product ${action.productId} x${action.quantity} added to cart`,
                timestamp: Date.now(),
              });
            }, 150);
          });
        });

      case 'checkout':
        return fromPromise(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                action: action.type,
                result: `Order ${action.cartId} checkout completed`,
                timestamp: Date.now(),
              });
            }, 300);
          });
        });

      default:
        return fromPromise(() =>
          Promise.resolve({
            action: 'unknown',
            result: 'Unknown operation',
            timestamp: Date.now(),
          })
        );
    }
  };

  // Use concatMap to ensure user actions are processed in order
  const processedActions$ = pipeFrom(
    userActions$,
    concatMap((action: any) => processAction(action)),
    map((result: any) => ({
      ...result,
      formattedTime: new Date(result.timestamp).toLocaleTimeString(),
    }))
  );

  const unsub9 = processedActions$(
    (result: any) => {
      console.log(`📊 [${result.formattedTime}] ${result.action}: ${result.result}`);
    },
    (error) => console.error('❌ Operation processing error:', error),
    () => console.log('🎉 All user operations processing completed')
  );
}, 10000);

// Example 7: error handling and retry mechanism
setTimeout(() => {
  console.log('\n7. error handling and retry mechanism:');

  const unreliableServices$ = of('Service A', 'Service B', 'Service C');

  // Simulate unstable service calls
  const callUnreliableService = (serviceName: string) => {
    console.log(`📞 Calling ${serviceName}`);
    return fromPromise(() => {
      return new Promise<string>((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.3) {
            // 70% success rate
            resolve(`${serviceName} response successful`);
          } else {
            reject(new Error(`${serviceName} call failed`));
          }
        }, 200);
      });
    });
  };

  // Use mergeMap for concurrent calls, but handle errors
  const serviceResults$ = pipeFrom(
    unreliableServices$,
    mergeMap((service: string) =>
      pipeFrom(
        callUnreliableService(service),
        map((result: string) => ({success: true, service, result}))
        // catchError can be added here to handle errors
      )
    )
  );

  const unsub10 = serviceResults$(
    (result: any) => {
      if (result.success) {
        console.log(`✅ ${result.service}: ${result.result}`);
      } else {
        console.log(`❌ ${result.service}: ${result.error}`);
      }
    },
    (error) => console.error('❌ Service call error:', error instanceof Error ? error.message : String(error)),
    () => console.log('🔚 All service calls completed')
  );
}, 12000);
