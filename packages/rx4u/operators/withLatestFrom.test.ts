import {describe, it, expect, vi} from 'vitest';
import type {Sub, Unsub, NextAction, ErrorAction, CompleteAction} from '@/types';
import {pipeFrom} from '@/pipeFrom';
import {of} from '@/creations/of';
import {interval} from '@/creations/interval';
import {take} from './take';
import {withLatestFrom} from './withLatestFrom';

describe('withLatestFrom', () => {
  it('should combine source with latest value from other stream', () => {
    const values: [number, string][] = [];
    let otherNext: ((value: string) => void) | undefined;
    let sourceNext: ((value: number) => void) | undefined;

    const source$ = (next?: (value: number) => void) => {
      sourceNext = next;
      return function () {};
    };

    const other$ = (next?: (value: string) => void) => {
      otherNext = next;
      return function () {};
    };

    const combined$ = pipeFrom(source$, withLatestFrom(other$));

    combined$((value) => values.push(value as [number, string]));

    // First let other$ emit values
    otherNext?.('a');
    otherNext?.('b');

    // Then source$ emits values, should combine with latest 'b'
    sourceNext?.(1);
    sourceNext?.(2);

    expect(values).toEqual([
      [1, 'b'],
      [2, 'b'],
    ]);
  });

  it('should not emit until other stream has emitted at least once', () => {
    const values: [number, string][] = [];
    let otherNext: ((value: string) => void) | undefined;

    const source$ = of(1, 2, 3);
    const other$ = (next?: (value: string) => void) => {
      otherNext = next;
      return function () {};
    };

    const combined$ = pipeFrom(source$, withLatestFrom(other$));

    combined$((value) => values.push(value as [number, string]));

    // other$ hasn't emitted yet, so there should be no output
    expect(values).toEqual([]);

    // Now other$ emits a value
    otherNext?.('x');

    // Still no output because source$ has already completed
    expect(values).toEqual([]);
  });

  it('should work with multiple other streams', () => {
    const values: [number, string, boolean][] = [];
    let sourceNext: ((value: number) => void) | undefined;
    let other1Next: ((value: string) => void) | undefined;
    let other2Next: NextAction<boolean> | undefined;

    const source$ = (next?: (value: number) => void) => {
      sourceNext = next;
      return function () {};
    };

    const other1$ = (next?: (value: string) => void) => {
      other1Next = next;
      return function () {};
    };

    const other2$: Sub<boolean> = (next?: NextAction<boolean>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
      other2Next = next;
      return function () {};
    };

    const combined$ = pipeFrom(source$, withLatestFrom(other1$, other2$));

    combined$((value) => values.push(value as [number, string, boolean]));

    // First let other streams emit values
    other1Next?.('a');
    (other2Next as any)?.(true);
    other1Next?.('b');
    (other2Next as any)?.(false);

    // Then source$ emits values
    sourceNext?.(1);
    sourceNext?.(2);
    sourceNext?.(3);

    expect(values).toEqual([
      [1, 'b', false],
      [2, 'b', false],
      [3, 'b', false],
    ]);
  });

  it('should handle errors from other streams', () => {
    const errorFn = vi.fn();
    const values: [number, string][] = [];

    const source$ = of(1, 2, 3);
    const other$ = (next?: any, error?: any) => {
      setTimeout(() => error?.(new Error('Other stream error')), 10);
      return function () {};
    };

    const combined$ = pipeFrom(source$, withLatestFrom(other$));

    combined$((value: unknown) => values.push(value as [number, string]), errorFn);

    setTimeout(() => {
      expect(values).toEqual([]);
      expect(errorFn).toHaveBeenCalledWith(expect.any(Error));
    }, 20);
  });

  it('should complete when source completes', () => {
    const completeFn = vi.fn();
    const values: [number, string][] = [];
    let sourceComplete: (() => void) | undefined;
    let otherComplete: (() => void) | undefined;

    const source$ = (next?: any, error?: any, complete?: any) => {
      sourceComplete = complete;
      return function () {};
    };

    const other$ = (next?: any, error?: any, complete?: any) => {
      otherComplete = complete;
      return function () {};
    };

    const combined$ = pipeFrom(source$, withLatestFrom(other$));

    combined$((value: unknown) => values.push(value as [number, string]), undefined, completeFn);

    // First complete other$
    otherComplete?.();
    // Then complete source$
    sourceComplete?.();

    expect(completeFn).toHaveBeenCalledTimes(1);
  });

  it('should emit when all other streams have emitted at least once (each only once)', () => {
    const values: [number, string, boolean][] = [];
    let sourceNext: ((value: number) => void) | undefined;
    let other1Next: ((value: string) => void) | undefined;
    let other2Next: NextAction<boolean> | undefined;

    const source$ = (next?: (value: number) => void) => {
      sourceNext = next;
      return function () {};
    };

    const other1$ = (next?: (value: string) => void) => {
      other1Next = next;
      return function () {};
    };

    const other2$: Sub<boolean> = (next?: NextAction<boolean>, error?: ErrorAction, complete?: CompleteAction): Unsub => {
      other2Next = next;
      return function () {};
    };

    const combined$ = pipeFrom(source$, withLatestFrom(other1$, other2$));

    combined$((value) => values.push(value as [number, string, boolean]));

    // Each other stream emits exactly once, in sequential order (index 0 then index 1)
    other1Next?.('a');
    other2Next?.(true);

    // Source emits — should combine since both others have emitted
    sourceNext?.(1);
    sourceNext?.(2);

    expect(values).toEqual([
      [1, 'a', true],
      [2, 'a', true],
    ]);
  });

  it('should work with async streams', () => {
    return new Promise<void>((resolve) => {
      const values: [number, number][] = [];

      const source$ = pipeFrom(interval(50), take(3));

      const other$ = pipeFrom(interval(30), take(5));

      const combined$ = pipeFrom(source$, withLatestFrom(other$));

      combined$(
        (value) => values.push(value),
        undefined,
        () => {
          // source$: 0(50ms), 1(100ms), 2(150ms)
          // other$: 0(30ms), 1(60ms), 2(90ms), 3(120ms), 4(150ms)
          // Expected result: [0,0], [1,2], [2,4]
          expect(values.length).toBeGreaterThan(0);
          resolve();
        }
      );
    });
  });
});
