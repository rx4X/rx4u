import type {Sub, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * Zip operator - pairs values from multiple sources in order.
 * Each source must emit at least one value before any combined value is emitted.
 * Uses isUnsubscribed guard to prevent post-unsubscribe callbacks.
 *
 * @param sources Sources to zip
 * @returns Zipped stream
 */
export function zip<T extends readonly unknown[]>(...sources: {[K in keyof T]: Sub<T[K]>}): Sub<T> {
  return function (next?: NextAction<T>, error?: ErrorAction, complete?: CompleteAction): Unsub {
    const buffers: unknown[][] = sources.map(() => []);
    const completed: boolean[] = new Array(sources.length).fill(false);
    const subscriber: Subscriber<T> = [next, error, complete];
    let completedCount = 0;
    let isUnsubscribed = false;

    const unsubs = sources.map((source, index) => {
      return source(
        next
          ? (value: unknown) => {
              if (isUnsubscribed) {
                return;
              }
              buffers[index].push(value);
              tryEmit();
            }
          : undefined,
        (err: unknown) => {
          if (isUnsubscribed) {
            return;
          }
          error?.(err);
        },
        () => {
          if (isUnsubscribed) {
            return;
          }
          completed[index] = true;
          completedCount++;
          tryEmit();
        }
      );
    });

    function tryEmit() {
      if (buffers.every((buffer) => buffer.length > 0)) {
        const values = buffers.map((buffer) => buffer.shift());
        callNext(subscriber, values as unknown as T);
      }
      if (completed.some((isCompleted, index) => isCompleted && buffers[index].length === 0)) {
        isUnsubscribed = true;
        complete?.();
      }
    }

    return function unsubscribe() {
      isUnsubscribed = true;
      unsubs.forEach((unsubFn) => unsubFn());
    };
  };
}
