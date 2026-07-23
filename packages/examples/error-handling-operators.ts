// Error handling operators examples
import {from, of, pipeFrom, map, catchError, retry, retryWhen, switchMap, mergeMap, fromPromise} from 'rx4u';

console.log('=== Error Handling Operators Examples ===\n');

// Example 1: catchError operator - catching and handling errors
console.log('1. catchError operator - catching and handling errors:');

// Simulate potentially failing API call
const unreliableAPI = (shouldFail: boolean = false) => {
  return fromPromise(
    () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (shouldFail) {
            reject(new Error('API call failed'));
          } else {
            resolve({data: 'Successfully retrieved data', timestamp: Date.now()});
          }
        }, 300);
      })
  );
};

// Use catchError to handle errors
const apiWithErrorHandling$ = pipeFrom(
  unreliableAPI(true), // Intentionally make it fail
  map((data: any) => `Processing successful: ${JSON.stringify(data)}`),
  catchError((error: unknown) => {
    const typedError = error instanceof Error ? error : new Error(String(error));
    console.log(`❌ Caught error: ${typedError.message}`);
    // Return a fallback value
    return of('Using fallback data');
  })
);

const unsub1 = apiWithErrorHandling$(
  (result) => console.log('✅ Final result:', result),
  (error) => console.log('❌ Unhandled error:', error),
  () => console.log('🔚 Stream completed')
);

// Example 2: retry operator - automatic retry
setTimeout(() => {
  console.log('\n2. retry operator - automatic retry:');

  let attemptCount = 0;

  // Simulate unstable service, fails first few times, then succeeds
  const unstableService = () => {
    attemptCount++;
    console.log(`🔄 Attempt ${attemptCount}`);

    return fromPromise(
      () =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            if (attemptCount < 3) {
              reject(new Error(`Attempt ${attemptCount} failed`));
            } else {
              resolve(`Attempt ${attemptCount} succeeded!`);
            }
          }, 200);
        })
    );
  };

  // Use retry to automatically retry up to 3 times
  const serviceWithRetry$ = pipeFrom(unstableService(), retry(3));

  const unsub2 = serviceWithRetry$(
    (result) => console.log('✅ Retry successful:', result),
    (error) => console.log('❌ Retry failed:', error instanceof Error ? error.message : String(error)),
    () => console.log('🔚 Retry stream completed')
  );
}, 1000);

// Example 3: retryWhen operator - conditional retry
setTimeout(() => {
  console.log('\n3. retryWhen operator - conditional retry:');

  let retryAttempt = 0;

  // Simulate network request
  const networkRequest = () => {
    retryAttempt++;
    console.log(`🌐 Network request attempt ${retryAttempt}`);

    return fromPromise(
      () =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate different types of errors
            const errorTypes = ['Network timeout', 'Server error', 'Authentication failed'];
            const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];

            if (retryAttempt < 4 && randomError !== 'Authentication failed') {
              reject(new Error(randomError));
            } else if (randomError === 'Authentication failed') {
              reject(new Error('Authentication failed - not retryable'));
            } else {
              resolve(`Network request successful (attempt ${retryAttempt})`);
            }
          }, 300);
        })
    );
  };

  // Use retryWhen to implement smart retry strategy
  const smartRetry$ = pipeFrom(
    networkRequest(),
    retryWhen((errors) => {
      return pipeFrom(
        errors,
        switchMap((error: unknown, index: number) => {
          const typedError = error instanceof Error ? error : new Error(String(error));
          console.log(`🤔 Analyzing error: ${typedError.message} (attempt ${index + 1})`);

          // If authentication failed, don't retry
          if (typedError.message.includes('Authentication failed')) {
            console.log('🚫 Authentication failed, stopping retry');
            throw typedError;
          }

          // Maximum 3 retries
          if (index >= 3) {
            console.log('🚫 Reached maximum retry attempts');
            throw typedError;
          }

          // Exponential backoff retry strategy
          const delay = Math.pow(2, index) * 1000;
          console.log(`⏰ Retrying after ${delay}ms (${(error as any).type ?? 'Unknown'})`);

          return fromPromise(
            () =>
              new Promise((resolve) => {
                setTimeout(() => resolve(null), delay);
              })
          );
        })
      );
    })
  );

  const unsub3 = smartRetry$(
    (result) => console.log('✅ Smart retry successful:', result),
    (error) => console.log('❌ Smart retry final failure:', error instanceof Error ? error.message : String(error)),
    () => console.log('🔚 Smart retry stream completed')
  );
}, 3000);

// Example 4: Combined error handling strategies
setTimeout(() => {
  console.log('\n4. Combined error handling strategies:');

  // Simulate multiple service calls
  const services = ['User Service', 'Order Service', 'Payment Service'];

  let serviceCallCount = 0;

  const callService = (serviceName: string) => {
    serviceCallCount++;
    console.log(`📞 Calling ${serviceName}`);

    return fromPromise(
      () =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate different failure rates
            const failureRate = serviceName === 'Payment Service' ? 0.7 : 0.3;

            if (Math.random() < failureRate) {
              reject(new Error(`${serviceName} call failed`));
            } else {
              resolve({
                service: serviceName,
                data: `${serviceName} data`,
                callId: serviceCallCount,
              });
            }
          }, 200);
        })
    );
  };

  // Create error-handled streams for each service
  const servicesWithErrorHandling$ = of(...services);

  const processedServices$ = pipeFrom(
    servicesWithErrorHandling$,
    mergeMap((serviceName: string) => {
      return pipeFrom(
        callService(serviceName),
        // Retry each service up to 2 times
        retry(2),
        // If still fails after retry, provide fallback data
        catchError((error: unknown) => {
          console.log(`⚠️  ${serviceName} retry failed, using fallback data`);
          return of({
            service: serviceName,
            data: `${serviceName} fallback data`,
            fallback: true,
            error: error instanceof Error ? error.message : String(error),
          });
        }),
        // Mark result type
        map((result: any) => ({
          ...result,
          success: !result.fallback,
          timestamp: new Date().toLocaleTimeString(),
        }))
      );
    })
  );

  const unsub4 = processedServices$(
    (result: any) => {
      const status = result.success ? '✅' : '⚠️ ';
      const type = result.success ? 'success' : 'fallback';
      console.log(`${status} [${result.timestamp}] ${result.service} ${type}:`, result.data);
    },
    (error) => console.log('❌ Service processing error:', error),
    () => console.log('🎉 All services processed')
  );
}, 6000);

// Example 5: Real-world application scenario - file download with error recovery
setTimeout(() => {
  console.log('\n5. Real-world application scenario - file download with error recovery:');

  const files = [
    {name: 'config.json', url: 'https://api.example.com/config.json', critical: true},
    {name: 'data.csv', url: 'https://api.example.com/data.csv', critical: false},
    {name: 'image.png', url: 'https://api.example.com/image.png', critical: false},
  ];

  let downloadAttempts = 0;

  // Simulate file download
  const downloadFile = (file: any) => {
    downloadAttempts++;
    console.log(`📥 Downloading ${file.name} (attempt ${downloadAttempts})`);

    return fromPromise(
      () =>
        new Promise((resolve, reject) => {
          setTimeout(
            () => {
              // Critical files have higher success rate
              const successRate = file.critical ? 0.7 : 0.5;

              if (Math.random() < successRate) {
                resolve({
                  fileName: file.name,
                  size: Math.floor(Math.random() * 1000) + 100,
                  downloadTime: Date.now(),
                });
              } else {
                reject(new Error(`${file.name} download failed`));
              }
            },
            Math.random() * 500 + 200
          );
        })
    );
  };

  // Process file downloads
  const fileDownloads$ = of(...files);

  const downloadResults$ = pipeFrom(
    fileDownloads$,
    mergeMap((file: any) => {
      return pipeFrom(
        downloadFile(file),
        // Critical files retry more times
        retry(file.critical ? 3 : 1),
        map((result: any) => ({
          ...result,
          success: true,
          critical: file.critical,
        })),
        catchError((error: unknown) => {
          const typedError = error instanceof Error ? error : new Error(String(error));
          console.log(`❌ ${file.name} download failed: ${typedError.message}`);

          if (file.critical) {
            // Throw error when critical file fails
            throw new Error(`Critical file ${file.name} download failed`);
          } else {
            // Return placeholder when non-critical file fails
            return of({
              fileName: file.name,
              success: false,
              error: error instanceof Error ? error.message : String(error),
              critical: false,
            });
          }
        })
      );
    })
  );

  const unsub5 = downloadResults$(
    (result: any) => {
      if (result.success) {
        const priority = result.critical ? '🔴' : '🟡';
        console.log(`${priority} ✅ ${result.fileName} download successful (${result.size}KB)`);
      } else {
        console.log(`🟡 ⚠️  ${result.fileName} download failed, using placeholder`);
      }
    },
    (error) => {
      console.log('🚨 Critical file download failed, application cannot start:', error instanceof Error ? error.message : String(error));
    },
    () => console.log('📦 File download process completed')
  );
}, 9000);

// Example 6: Error classification and handling strategies
setTimeout(() => {
  console.log('\n6. Error classification and handling strategies:');

  // Define different types of errors
  const errorTypes = [
    {type: 'NetworkError', message: 'Network connection failed', retryable: true},
    {type: 'AuthError', message: 'Authentication failed', retryable: false},
    {type: 'ServerError', message: 'Internal server error', retryable: true},
    {type: 'ValidationError', message: 'Data validation failed', retryable: false},
  ];

  let requestCount = 0;

  // Simulate requests that may produce different errors
  const makeRequest = () => {
    requestCount++;
    console.log(`🎯 Making request ${requestCount}`);

    return fromPromise(
      () =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            if (requestCount <= 3) {
              // First few requests randomly fail
              const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
              const error = new Error(randomError.message);
              (error as any).type = randomError.type;
              (error as any).retryable = randomError.retryable;
              reject(error);
            } else {
              resolve(`Request successful (attempt ${requestCount})`);
            }
          }, 300);
        })
    );
  };

  // Smart error handling strategy
  const smartErrorHandling$ = pipeFrom(
    makeRequest(),
    retryWhen((errors) => {
      return pipeFrom(
        errors,
        switchMap((error: any, index: number) => {
          const typedError = error instanceof Error ? error : new Error(String(error));
          console.log(`🔍 Error analysis: ${error.type} - ${typedError.message}`);

          // Non-retryable errors are thrown directly
          if (!error.retryable) {
            console.log('🚫 Error is not retryable');
            throw typedError;
          }

          // Maximum retry attempts reached
          if (index >= 2) {
            console.log('🚫 Maximum retry attempts reached');
            throw typedError;
          }

          // Adjust retry delay based on error type
          let delay = 1000;
          if (error.type === 'NetworkError') {
            delay = 2000; // Longer delay for network errors
          } else if (error.type === 'ServerError') {
            delay = 500; // Shorter delay for server errors
          }

          console.log(`⏰ Retrying after ${delay}ms (${(error as any).type ?? 'Unknown'})`);

          return fromPromise(
            () =>
              new Promise((resolve) => {
                setTimeout(() => resolve(null), delay);
              })
          );
        })
      );
    }),
    catchError((error: any) => {
      console.log(`⚠️  Final error handling: ${error.type}`);

      // Return different fallback values based on error type
      switch (error.type) {
        case 'AuthError':
          return of('Please log in again');
        case 'ValidationError':
          return of('Please check input data');
        default:
          return of('Service temporarily unavailable, please try again later');
      }
    })
  );

  const unsub6 = smartErrorHandling$(
    (result: any) => console.log('🎉 Final result:', result),
    (error) => console.log('❌ Unhandled error:', error),
    () => console.log('🔚 Smart error handling completed')
  );
}, 12000);

// Example 7: Error monitoring and logging
setTimeout(() => {
  console.log('\n7. Error monitoring and logging:');

  // Error statistics
  const errorStats = {
    total: 0,
    byType: {} as Record<string, number>,
    retries: 0,
  };

  // Simulate business operations
  const businessOperations = ['Create Order', 'Process Payment', 'Send Email', 'Update Inventory'];

  let operationCount = 0;

  const performOperation = (operation: string) => {
    operationCount++;
    console.log(`⚙️  Executing operation: ${operation}`);

    return fromPromise(() => {
      return new Promise<string>((resolve, reject) => {
        setTimeout(() => {
          // 30% failure rate
          if (Math.random() < 0.3) {
            const errorType = Math.random() < 0.5 ? 'BusinessError' : 'SystemError';
            const error = new Error(`${operation} execution failed`);
            (error as any).type = errorType;
            (error as any).operation = operation;
            reject(error);
          } else {
            resolve(`${operation} executed successfully`);
          }
        }, 200);
      });
    });
  };

  // Monitored operation flow
  const monitoredOperations$ = of(...businessOperations);

  const operationsWithMonitoring$ = pipeFrom(
    monitoredOperations$,
    mergeMap((operation: string) => {
      return pipeFrom(
        performOperation(operation),
        retryWhen<string>((errors) => {
          return pipeFrom(
            errors,
            switchMap((error: any, index: number) => {
              const typedError = error instanceof Error ? error : new Error(String(error));
              // Record error statistics
              errorStats.total++;
              errorStats.retries++;
              errorStats.byType[error.type] = (errorStats.byType[error.type] || 0) + 1;

              console.log(`📊 Error statistics - Total: ${errorStats.total}, Retries: ${errorStats.retries}`);
              console.log(`📈 Error type distribution:`, errorStats.byType);

              if (index >= 1) {
                throw typedError;
              }

              console.log(`🔄 Retrying ${error.operation}`);
              return fromPromise<null>(() => Promise.resolve(null));
            })
          );
        }),
        map((result: string) => ({
          operation,
          result,
          success: true,
          timestamp: new Date().toISOString(),
        })),
        catchError((error: any) => {
          console.log(`📝 Recording final failure: ${error.operation} - ${error.type}`);
          return of({
            operation: error.operation,
            result: error instanceof Error ? error.message : String(error),
            success: false,
            errorType: error.type,
            timestamp: new Date().toISOString(),
          });
        })
      );
    })
  );

  const unsub7 = operationsWithMonitoring$(
    (result: any) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} [${result.timestamp.split('T')[1].split('.')[0]}] ${result.operation}: ${result.result}`);
    },
    (error) => console.log('❌ Monitoring system error:', error),
    () => {
      console.log('\n📊 Final error statistics report:');
      console.log(`Total errors: ${errorStats.total}`);
      console.log(`Retry count: ${errorStats.retries}`);
      console.log(`Error type distribution:`, errorStats.byType);
      console.log('🔚 Error monitoring completed');
    }
  );
}, 15000);
