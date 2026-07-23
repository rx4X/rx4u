import type {Sub, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * Merge multiple streams into a single stream.
 *
 * @param sources Array of streams to merge
 * @returns Merged stream
 */
export function merge<T>(...sources: Sub<T>[]): Sub<T> {
  return function (next?: NextAction<T>, error?: ErrorAction, complete?: CompleteAction): Unsub {
    const subscriber: Subscriber<T> = [next, error, complete];
    let completedCount = 0;
    let isUnsubscribed = false;
    const unsubs: Unsub[] = [];

    function teardown(): void {
      if (isUnsubscribed) {
        return;
      }
      isUnsubscribed = true;
      unsubs.forEach((unsubFn) => unsubFn());
    }

    sources.forEach((source) => {
      const unsub = source(
        (value: T) => {
          if (isUnsubscribed) {
            return;
          }
          callNext(subscriber, value);
        },
        (err: unknown) => {
          if (isUnsubscribed) {
            return;
          }
          teardown();
          error?.(err);
        },
        () => {
          if (isUnsubscribed) {
            return;
          }
          completedCount++;
          if (completedCount === sources.length) {
            teardown();
            complete?.();
          }
        }
      );
      if (isUnsubscribed) {
        unsub();
      } else {
        unsubs.push(unsub);
      }
    });

    return function unsubscribe() {
      teardown();
    };
  };
}
