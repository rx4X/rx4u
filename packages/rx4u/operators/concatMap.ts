import type {Sub, Operator, Unsub, NextAction, ErrorAction, CompleteAction, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * Concat map operator - maps each source value to a stream, concatenating all inner streams in order.
 * Maintains a bounded buffer by processing items sequentially.
 *
 * @param project Mapping function
 * @returns Operator function
 */
export function concatMap<T, R>(project: (value: T, index: number) => Sub<R>): Operator<T, R> {
  return (source: Sub<T>): Sub<R> => {
    return function (next?: NextAction<R>, error?: ErrorAction, complete?: CompleteAction): Unsub {
      const buffer: {value: T; index: number}[] = [];
      const subscriber: Subscriber<R> = [next, error, complete];
      let index = 0;
      let outerCompleted = false;
      let currentInnerUnsub: Unsub | null = null;
      let isProcessing = false;
      let isUnsubscribed = false;
      let outerUnsub: Unsub = () => {};

      function teardown(): void {
        if (isUnsubscribed) {
          return;
        }
        isUnsubscribed = true;
        outerUnsub();
        currentInnerUnsub?.();
        currentInnerUnsub = null;
        buffer.length = 0;
      }

      outerUnsub = source(
        next
          ? (value: T) => {
              if (isUnsubscribed) {
                return;
              }
              buffer.push({value, index: index++});
              processNext();
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
          if (!isProcessing && buffer.length === 0) {
            teardown();
            complete?.();
          }
        }
      );

      function processNext() {
        if (isProcessing || buffer.length === 0) {
          return;
        }

        isProcessing = true;
        const {value, index: idx} = buffer.shift()!;

        try {
          const inner$ = project(value, idx);
          let innerClosed = false;
          const innerUnsub = inner$(
            (innerValue: R) => {
              if (isUnsubscribed) {
                return;
              }
              callNext(subscriber, innerValue);
            },
            (err: unknown) => {
              if (isUnsubscribed) {
                return;
              }
              innerClosed = true;
              teardown();
              error?.(err);
            },
            () => {
              if (isUnsubscribed) {
                return;
              }
              innerClosed = true;
              isProcessing = false;
              currentInnerUnsub = null;

              if (buffer.length > 0) {
                processNext();
              } else if (outerCompleted) {
                teardown();
                complete?.();
              }
            }
          );
          if (innerClosed || isUnsubscribed) {
            innerUnsub();
          } else {
            currentInnerUnsub = innerUnsub;
          }
        } catch (err) {
          isProcessing = false;
          currentInnerUnsub = null;
          error?.(err);
          if (buffer.length > 0) {
            processNext();
          } else if (outerCompleted) {
            teardown();
            complete?.();
          }
        }
      }

      return function unsubscribe() {
        teardown();
      };
    };
  };
}
