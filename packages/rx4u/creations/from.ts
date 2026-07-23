import type {Sub, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * Creates a stream from a factory function.
 * The factory is executed synchronously on each subscription.
 *
 * @param create Factory function that returns a value
 * @returns A Sub that executes the factory and emits the result
 */
export function from<T>(create: () => T): Sub<T> {
  return function (next?: NextAction<T>, error?: ErrorAction, complete?: CompleteAction): Unsub {
    const subscriber: Subscriber<T> = [next, error, complete];
    let cancelled = false;

    function execute() {
      try {
        const result = create();
        if (!cancelled) {
          callNext(subscriber, result);
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
