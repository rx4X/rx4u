import {describe, it, expect, vi} from 'vitest';
import type {NextAction, Sub, Unsub} from '../types';
import {of} from '../creations/of';
import {interval} from '../creations/interval';
import {takeUntil} from './takeUntil';
import {pipeFrom} from '../pipeFrom';

describe('takeUntil operator', () => {
  it('should emit values until notifier emits', async () => {
    const results: number[] = [];
    const source = interval(10);
    const notifier = (next: any) => {
      const id = setTimeout(() => next(1), 45); // Should allow 4 values (0, 1, 2, 3)
      return () => clearTimeout(id);
    };

    await new Promise<void>((resolve) => {
      pipeFrom(source, takeUntil(notifier))((value) => results.push(value), undefined, resolve);
    });

    // Exact count might vary slightly based on timing, but should be around 4
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThan(10);
  });

  it('should complete immediately if notifier emits immediately', async () => {
    const results: number[] = [];
    const source = interval(10);
    const notifier = of(1);

    await new Promise<void>((resolve) => {
      pipeFrom(source, takeUntil(notifier))((value) => results.push(value), undefined, resolve);
    });

    expect(results).toEqual([]);
  });

  it('should handle notifier errors', async () => {
    const source = interval(10);
    const notifier = (_next: any, error: any) => {
      error(new Error('Notifier error'));
      return function () {};
    };
    const errorFn = vi.fn();

    await new Promise<void>((resolve) => {
      pipeFrom(source, takeUntil(notifier))(
        () => {},
        (err) => {
          errorFn(err);
          resolve();
        },
        resolve
      );
    });

    expect(errorFn).toHaveBeenCalled();
  });

  it('should unsubscribe from source when notifier emits', () => {
    const unsubSource = vi.fn();
    const source = (_next: any) => unsubSource;
    const notifier = of(1); // Emits immediately

    pipeFrom(source, takeUntil(notifier))(() => {});

    // Wait for microtask
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(unsubSource).toHaveBeenCalled();
        resolve();
      }, 0);
    });
  });

  it('should unsubscribe from notifier when source completes', async () => {
    const unsubNotifier = vi.fn();
    const source = of(1, 2, 3);
    const notifier = (_next: any) => unsubNotifier;

    await new Promise<void>((resolve) => {
      pipeFrom(source, takeUntil(notifier))(() => {}, undefined, resolve);
    });

    expect(unsubNotifier).toHaveBeenCalled();
  });

  it('cleans up a notifier that emits synchronously', () => {
    let cleanupCalls = 0;
    const notifier$: Sub<void> = (next?: NextAction<void>): Unsub => {
      next?.();
      return function unsubscribe() {
        cleanupCalls++;
      };
    };

    pipeFrom(of(1), takeUntil(notifier$))();

    expect(cleanupCalls).toBe(1);
  });
});
