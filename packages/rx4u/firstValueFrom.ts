import type {Sub, Unsub, Subscriber} from '@/types';

/**
 * Converts a stream to a Promise that resolves with the first emitted value.
 * Properly handles synchronous sources by initializing unsub to a no-op.
 *
 * @param source The stream to convert
 * @returns Promise resolving with the first value, or rejecting if the stream errors or completes empty
 */
export function firstValueFrom<T>(source: Sub<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const subscriber: Subscriber<T> = [
      (value: T) => {
        if (!hasValue) {
          hasValue = true;
          resolve(value);
          shouldUnsub = true;
          unsub();
        }
      },
      (err: unknown) => {
        if (!hasValue) {
          reject(err);
        }
      },
      () => {
        if (!hasValue) {
          reject(new Error('No elements in sequence'));
        }
      },
    ];
    let hasValue = false;
    let shouldUnsub = false;
    // Initialize to no-op to avoid TDZ issue with synchronous sources.
    let unsub: Unsub = () => {};

    unsub = source(subscriber[0], subscriber[1], subscriber[2]);
    if (shouldUnsub) {
      unsub();
    }
  });
}
