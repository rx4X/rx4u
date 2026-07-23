import {describe, it, expect, vi} from 'vitest';
import {of} from '@/creations/of';
import {pipeFrom} from '@/pipeFrom';
import {tap} from './tap';

describe('tap', () => {
  it('should execute side effect without changing the data', () => {
    return new Promise<void>((resolve) => {
      const sideEffectFn = vi.fn();
      const values: number[] = [];

      const source$ = of(1, 2, 3);
      const tapped$ = pipeFrom(source$, tap(sideEffectFn));

      tapped$(
        (value) => values.push(value),
        undefined,
        () => {
          expect(values).toEqual([1, 2, 3]);
          expect(sideEffectFn).toHaveBeenCalledTimes(3);
          expect(sideEffectFn).toHaveBeenCalledWith(1);
          expect(sideEffectFn).toHaveBeenCalledWith(2);
          expect(sideEffectFn).toHaveBeenCalledWith(3);
          resolve();
        }
      );
    });
  });

  it('should handle errors in tap function', () => {
    return new Promise<void>((resolve) => {
      const values: number[] = [];
      const errorFn = vi.fn((error) => {
        expect(values).toEqual([1]);
        expect(errorFn).toHaveBeenCalledWith(expect.any(Error));
        resolve();
      });

      const source$ = of(1, 2, 3);
      const tapped$ = pipeFrom(
        source$,
        tap((value) => {
          if (value === 2) {
            throw new Error('Tap error');
          }
        })
      );

      tapped$((value) => values.push(value), errorFn);
    });
  });

  it('should not affect completion', () => {
    return new Promise<void>((resolve) => {
      const sideEffectFn = vi.fn();
      const completeFn = vi.fn(() => {
        expect(completeFn).toHaveBeenCalledTimes(1);
        expect(sideEffectFn).toHaveBeenCalledTimes(3);
        resolve();
      });

      const source$ = of(1, 2, 3);
      const tapped$ = pipeFrom(source$, tap(sideEffectFn));

      tapped$(() => {}, undefined, completeFn);
    });
  });

  it('should work with multiple tap operators', () => {
    return new Promise<void>((resolve) => {
      const sideEffect1 = vi.fn();
      const sideEffect2 = vi.fn();
      const values: number[] = [];

      const source$ = of(1, 2, 3);
      const tapped$ = pipeFrom(source$, tap(sideEffect1), tap(sideEffect2));

      tapped$(
        (value) => values.push(value),
        undefined,
        () => {
          expect(values).toEqual([1, 2, 3]);
          expect(sideEffect1).toHaveBeenCalledTimes(3);
          expect(sideEffect2).toHaveBeenCalledTimes(3);
          resolve();
        }
      );
    });
  });
});
