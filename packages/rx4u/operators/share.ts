import type {Sub, Operator, Unsub, Subscriber} from '@/types';
import {broadcastNext, broadcastError, broadcastComplete} from '@/util';

/**
 * Share operator - allows multiple subscribers to share the same source execution.
 * Uses reference counting: source is subscribed when first subscriber arrives,
 * unsubscribed when all subscribers leave.
 * Cleans up subscribers Set on source completion/error to prevent memory leaks.
 * Checks all subscribers for valid next callback, not just the first one.
 */
export function share<T>(): Operator<T, T> {
  return (source: Sub<T>) => {
    const subscribers = new Set<Subscriber<T>>();

    let refCount = 0;
    let sourceUnsub: Unsub | null = null;
    let hasStarted = false;
    let isTerminated = false;
    let terminalKind: 'error' | 'complete' | null = null;
    let terminalError: unknown = undefined;

    function dispatchToAll(value: T) {
      broadcastNext(subscribers, value);
    }

    function dispatchError(err: unknown) {
      isTerminated = true;
      terminalKind = 'error';
      terminalError = err;
      sourceUnsub = null;
      hasStarted = false;
      refCount = 0;
      broadcastError(subscribers, err);
    }

    function dispatchComplete() {
      isTerminated = true;
      terminalKind = 'complete';
      sourceUnsub = null;
      hasStarted = false;
      refCount = 0;
      broadcastComplete(subscribers);
    }

    function hasAnyNextCallback(): boolean {
      for (const sub of subscribers) {
        if (sub[0]) {
          return true;
        }
      }
      return false;
    }

    return function (...subscriber: Subscriber<T>): Unsub {
      if (isTerminated) {
        if (terminalKind === 'error') {
          subscriber[1]?.(terminalError);
        } else {
          subscriber[2]?.();
        }
        return function unsubscribeTerminated() {};
      }

      subscribers.add(subscriber);
      refCount++;

      if (!hasStarted) {
        hasStarted = true;
        queueMicrotask(() => {
          if (isTerminated || subscribers.size === 0) {
            return;
          }

          sourceUnsub = source(
            hasAnyNextCallback() ? (value: T) => dispatchToAll(value) : undefined,
            (err: unknown) => dispatchError(err),
            () => dispatchComplete()
          );
        });
      }

      return function unsubscribe() {
        if (isTerminated) {
          return;
        }
        if (subscribers.delete(subscriber)) {
          refCount--;
        }

        if (refCount === 0 && sourceUnsub) {
          sourceUnsub();
          sourceUnsub = null;
          hasStarted = false;
        }
      };
    };
  };
}
