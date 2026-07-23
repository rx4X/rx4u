import type {Sub, Unsub, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * Creates a stream that emits the provided values in sequence, then completes.
 * Emission is deferred to the microtask queue to allow cancellation before values are emitted.
 *
 * @param values Values to emit
 * @returns A Sub that emits each value then completes
 */
export function of<T>(...values: T[]): Sub<T> {
  return function (...subscriber: Subscriber<T>): Unsub {
    let cancelled = false;

    // Use microtask to make emission async and allow cancellation before emission
    Promise.resolve().then(() => {
      if (cancelled) {
        return;
      }

      try {
        for (const value of values) {
          if (cancelled) {
            break;
          }
          callNext(subscriber, value);
        }

        if (!cancelled) {
          subscriber[2]?.();
        }
      } catch (err) {
        if (!cancelled) {
          subscriber[1]?.(err);
        }
      }
    });

    return function () {
      cancelled = true;
    };
  };
}
