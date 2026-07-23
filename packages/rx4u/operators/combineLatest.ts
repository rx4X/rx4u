import type {Sub, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * Combine latest values operator - emits latest values from all sources when any source emits.
 * Uses O(1) readyCount check with hasEmitted tracking.
 *
 * @param sources Array of sources to combine
 * @returns Combined stream
 */
export function combineLatest<T extends readonly unknown[]>(...sources: {[K in keyof T]: Sub<T[K]>}): Sub<T> {
  return function (next?: NextAction<T>, error?: ErrorAction, complete?: CompleteAction): Unsub {
    const values: unknown[] = new Array(sources.length);
    const hasEmitted: boolean[] = new Array(sources.length).fill(false);
    const subscriber: Subscriber<T> = [next, error, complete];
    let readyCount = 0;
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

    sources.forEach((source, index) => {
      const unsub = source(
        next
          ? (value: unknown) => {
              if (isUnsubscribed) {
                return;
              }
              values[index] = value;
              if (!hasEmitted[index]) {
                hasEmitted[index] = true;
                readyCount++;
              }
              if (readyCount >= sources.length) {
                callNext(subscriber, [...values] as unknown as T);
              }
            }
          : undefined,
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
