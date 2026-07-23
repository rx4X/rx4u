import {describe, it, expect} from 'vitest';
import type {NextAction, Sub, Unsub} from '@/types';
import {of} from '@/creations/of';
import {interval} from '@/creations/interval';
import {pipeFrom} from '@/pipeFrom';
import {take} from '@/operators/take';
import {firstValueFrom} from './firstValueFrom';

describe('firstValueFrom', () => {
  it('should return the first value as a Promise', async () => {
    const source$ = of(1, 2, 3);

    const result = await firstValueFrom(source$);

    expect(result).toBe(1);
  });

  it('should reject if source is empty', async () => {
    const source$ = (next: any, error: any, complete: any) => {
      setTimeout(() => complete(), 0);
      return function () {};
    };

    await expect(firstValueFrom(source$)).rejects.toThrow('No elements in sequence');
  });

  it('should reject if source errors', async () => {
    const source$ = (next: any, error: any) => {
      setTimeout(() => error(new Error('Test error')), 10);
      return function () {};
    };

    await expect(firstValueFrom(source$)).rejects.toThrow('Test error');
  });

  it('should work with interval and take', async () => {
    const source$ = pipeFrom(interval(10), take(3));

    const result = await firstValueFrom(source$);

    expect(result).toBe(0);
  });

  it('should unsubscribe after getting first value', async () => {
    let subscriptionCount = 0;
    let unsubscribeCount = 0;

    const source$ = (next: any) => {
      subscriptionCount++;
      setTimeout(() => {
        next(1);
        next(2);
        next(3);
      }, 10);

      return function () {
        unsubscribeCount++;
      };
    };

    const result = await firstValueFrom(source$);

    expect(result).toBe(1);
    expect(subscriptionCount).toBe(1);
    expect(unsubscribeCount).toBe(1);
  });

  it('cleans up a synchronous source after receiving its first value', async () => {
    let cleanupCalls = 0;
    const source$: Sub<number> = (next?: NextAction<number>): Unsub => {
      next?.(1);
      return function unsubscribe() {
        cleanupCalls++;
      };
    };

    await expect(firstValueFrom(source$)).resolves.toBe(1);
    expect(cleanupCalls).toBe(1);
  });
});
