import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * Merge map operator - maps each value to a new stream and merges all results.
 * Uses Set for O(1) cleanup of inner subscriptions.
 *
 * @param project Mapping function
 * @param concurrent Concurrency limit
 * @returns Operator function
 */
export function mergeMap<T, R>(project: (value: T, index: number) => Sub<R>, concurrent?: number): Operator<T, R> {
  return (source: Sub<T>): Sub<R> => {
    return function (next?: NextAction<R>, error?: ErrorAction, complete?: CompleteAction): Unsub {
      const innerUnsubs = new Set<Unsub>();
      const buffer: {value: T; index: number}[] = [];
      const maxConcurrent = concurrent ?? Infinity;
      const subscriber: Subscriber<R> = [next, error, complete];
      let index = 0;
      let outerCompleted = false;
      let activeInnerCount = 0;
      let isUnsubscribed = false;
      let outerUnsub: Unsub = () => {};

      function teardown(): void {
        if (isUnsubscribed) {
          return;
        }
        isUnsubscribed = true;
        outerUnsub();
        innerUnsubs.forEach((unsubFn) => unsubFn());
        innerUnsubs.clear();
        buffer.length = 0;
      }

      outerUnsub = source(
        next
          ? (value: T) => {
              if (isUnsubscribed) {
                return;
              }
              subscribeToInner(value, index++);
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
          outerCompleted = true;
          checkComplete();
        }
      );

      function checkComplete() {
        if (outerCompleted && activeInnerCount === 0) {
          teardown();
          complete?.();
        }
      }

      function subscribeToInner(value: T, idx: number) {
        if (activeInnerCount >= maxConcurrent) {
          buffer.push({value, index: idx});
          return;
        }

        activeInnerCount++;

        try {
          const inner$ = project(value, idx);
          let innerUnsub: Unsub | null = null;
          let innerClosed = false;

          const onError = (err: unknown) => {
            if (isUnsubscribed) {
              return;
            }
            innerClosed = true;
            teardown();
            error?.(err);
          };

          const onComplete = () => {
            if (isUnsubscribed) {
              return;
            }
            innerClosed = true;
            if (innerUnsub) {
              innerUnsubs.delete(innerUnsub);
            }
            activeInnerCount--;

            if (buffer.length > 0) {
              const nextItem = buffer.shift()!;
              subscribeToInner(nextItem.value, nextItem.index);
            }
            checkComplete();
          };

          innerUnsub = inner$(
            (innerValue: R) => {
              if (isUnsubscribed) {
                return;
              }
              callNext(subscriber, innerValue);
            },
            onError,
            onComplete
          );
          if (innerClosed || isUnsubscribed) {
            innerUnsub();
          } else {
            innerUnsubs.add(innerUnsub);
          }
        } catch (err) {
          activeInnerCount--;
          teardown();
          error?.(err);
        }
      }

      return function unsubscribe() {
        teardown();
      };
    };
  };
}
