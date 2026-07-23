import type {Subscriber} from '@/types';

export function callNext<T>([next, error]: Subscriber<T>, value?: T): void {
  try {
    next?.(value!);
  } catch (err) {
    // If next handler throws, we should propagate it to error handler
    // But we must ensure error handler itself doesn't crash the whole process
    try {
      error?.(err);
    } catch (e) {
      // Last resort: log to console if even error handler fails
      console.error('Error in error handler:', e);
    }
  }
}

/**
 * Clears a timeout and returns null for easy reassignment.
 * Usage: `timerId = clearTimer(timerId);`
 */
export function clearTimer(timerId: ReturnType<typeof setTimeout> | null): null {
  if (timerId) {
    clearTimeout(timerId);
  }
  return null;
}

/**
 * Takes a snapshot of subscribers and dispatches a value to each via callNext.
 * The snapshot prevents issues with concurrent modification during iteration.
 */
export function broadcastNext<T>(subscribers: Set<Subscriber<T>>, value: T): void {
  for (const sub of [...subscribers]) {
    callNext(sub, value);
  }
}

/**
 * Takes a snapshot, clears the set, then dispatches an error to each subscriber.
 */
export function broadcastError<T>(subscribers: Set<Subscriber<T>>, err: unknown): void {
  const snapshot = [...subscribers];
  subscribers.clear();
  for (const sub of snapshot) {
    sub[1]?.(err);
  }
}

/**
 * Takes a snapshot, clears the set, then dispatches complete to each subscriber.
 */
export function broadcastComplete<T>(subscribers: Set<Subscriber<T>>): void {
  const snapshot = [...subscribers];
  subscribers.clear();
  for (const sub of snapshot) {
    sub[2]?.();
  }
}
