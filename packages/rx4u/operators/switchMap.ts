import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * Switch map operator - maps each source value to an inner stream, keeping only the latest.
 * Uses a generation counter to prevent stale Promise results from being emitted.
 *
 * @param project Mapping function that returns an inner stream or Promise
 * @returns Operator function
 */
export function switchMap<T, R>(project: (value: T, index: number) => Sub<R> | Promise<R>): Operator<T, R> {
  return (source: Sub<T>): Sub<R> => {
    return function (next?: NextAction<R>, error?: ErrorAction, complete?: CompleteAction): Unsub {
      const subscriber: Subscriber<R> = [next, error, complete];
      let index = 0;
      let generation = 0;
      let innerUnsub: Unsub | null = null;
      let outerCompleted = false;
      let activeInnerCount = 0;
      let isUnsubscribed = false;
      let outerUnsub: Unsub = () => {};

      function doComplete() {
        if (outerCompleted && activeInnerCount === 0 && !isUnsubscribed) {
          isUnsubscribed = true;
          complete?.();
        }
      }

      function cancelInner() {
        if (innerUnsub) {
          innerUnsub();
          innerUnsub = null;
          activeInnerCount--;
          doComplete();
        }
      }

      function fail(err: unknown): void {
        if (isUnsubscribed) {
          return;
        }
        isUnsubscribed = true;
        outerUnsub();
        if (innerUnsub) {
          innerUnsub();
          innerUnsub = null;
        }
        activeInnerCount = 0;
        error?.(err);
      }

      outerUnsub = source(
        next
          ? (value: T) => {
              if (isUnsubscribed) {
                return;
              }
              const currentGen = ++generation;

              // Cancel previous inner subscription
              cancelInner();

              try {
                const inner$ = project(value, index++);
                if (inner$ instanceof Promise) {
                  activeInnerCount = 1;
                  inner$
                    .then((innerValue: R) => {
                      if (!isUnsubscribed && currentGen === generation) {
                        callNext(subscriber, innerValue);
                      }
                    })
                    .catch((err: unknown) => {
                      if (!isUnsubscribed && currentGen === generation) {
                        fail(err);
                      }
                    })
                    .finally(() => {
                      if (!isUnsubscribed && currentGen === generation && activeInnerCount > 0) {
                        activeInnerCount--;
                        doComplete();
                      }
                    });
                  return;
                }

                activeInnerCount++;
                let innerClosed = false;
                const nextInnerUnsub = inner$(
                  (innerValue: R) => {
                    if (isUnsubscribed) {
                      return;
                    }
                    callNext(subscriber, innerValue);
                  },
                  (err: unknown) => {
                    innerClosed = true;
                    fail(err);
                  },
                  () => {
                    if (isUnsubscribed) {
                      return;
                    }
                    innerClosed = true;
                    activeInnerCount--;
                    innerUnsub = null;
                    doComplete();
                  }
                );
                if (innerClosed || isUnsubscribed) {
                  nextInnerUnsub();
                } else {
                  innerUnsub = nextInnerUnsub;
                }
              } catch (err) {
                fail(err);
              }
            }
          : undefined,
        (err: unknown) => {
          fail(err);
        },
        () => {
          if (isUnsubscribed) {
            return;
          }
          outerCompleted = true;
          doComplete();
        }
      );

      return function unsubscribe() {
        isUnsubscribed = true;
        outerUnsub();
        if (innerUnsub) {
          innerUnsub();
          innerUnsub = null;
          activeInnerCount--;
        }
      };
    };
  };
}
