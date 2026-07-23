import type {Sub, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * Creates a stream from a Promise factory.
 * The factory is called immediately on subscription.
 * If unsubscribed before the Promise resolves, the result is discarded.
 *
 * @param create Factory function that returns a Promise
 * @returns A Sub that awaits the Promise and emits the result
 */
export function fromPromise<T>(create: () => Promise<T>): Sub<T> {
  return function (next?: NextAction<T>, error?: ErrorAction, complete?: CompleteAction): Unsub {
    const subscriber: Subscriber<T> = [next, error, complete];
    let cancelled = false;

    async function execute() {
      try {
        const promise = create();
        if (cancelled) {
          return;
        }
        const value = await promise;
        if (!cancelled) {
          callNext(subscriber, value);
          complete?.();
        }
      } catch (err) {
        if (!cancelled) {
          error?.(err);
        }
      }
    }

    execute();

    return function unsubscribe() {
      cancelled = true;
    };
  };
}
