import type {Sub, Unsub, Subscriber} from '@/types';
import {callNext} from '@/util';

/**
 * Creates a stream that emits incrementing numbers at specified intervals.
 *
 * @param period Time in milliseconds between each emission
 * @returns A Sub that emits 0, 1, 2, ... at the given interval
 */
export function interval(period: number): Sub<number> {
  return function (...subscriber: Subscriber<number>): Unsub {
    let count = 0;
    const intervalId = setInterval(() => {
      callNext(subscriber, count++);
    }, period);

    return function () {
      clearInterval(intervalId);
    };
  };
}
