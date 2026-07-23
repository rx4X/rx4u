import {describe, it, expect, vi} from 'vitest';
import {of} from '../creations/of';
import {takeWhile} from './takeWhile';
import {pipeFrom} from '../pipeFrom';

describe('takeWhile operator', () => {
  it('should emit values while predicate returns true', async () => {
    const results: number[] = [];
    const source = of(1, 2, 3, 4, 5);

    await new Promise<void>((resolve) => {
      pipeFrom(
        source,
        takeWhile((x) => x < 4)
      )((value) => results.push(value), undefined, resolve);
    });

    expect(results).toEqual([1, 2, 3]);
  });

  it('should include the last value if inclusive is true', async () => {
    const results: number[] = [];
    const source = of(1, 2, 3, 4, 5);

    await new Promise<void>((resolve) => {
      pipeFrom(
        source,
        takeWhile((x) => x < 4, true)
      )((value) => results.push(value), undefined, resolve);
    });

    expect(results).toEqual([1, 2, 3, 4]);
  });

  it('should provide index to predicate', async () => {
    const results: number[] = [];
    const source = of(10, 20, 30, 40);

    await new Promise<void>((resolve) => {
      pipeFrom(
        source,
        takeWhile((_, index) => index < 2)
      )((value) => results.push(value), undefined, resolve);
    });

    expect(results).toEqual([10, 20]);
  });

  it('should handle empty source', async () => {
    const results: any[] = [];
    const source = of();
    const complete = vi.fn();

    await new Promise<void>((resolve) => {
      pipeFrom(
        source,
        takeWhile(() => true)
      )(
        (value) => results.push(value),
        undefined,
        () => {
          complete();
          resolve();
        }
      );
    });

    expect(results).toEqual([]);
    expect(complete).toHaveBeenCalled();
  });

  it('should handle errors in predicate', async () => {
    const source = of(1, 2, 3);
    const error = vi.fn();

    await new Promise<void>((resolve) => {
      pipeFrom(
        source,
        takeWhile((x) => {
          if (x === 2) throw new Error('Test error');
          return true;
        })
      )(
        () => {},
        (err) => {
          error(err);
          resolve();
        },
        () => resolve()
      );
    });

    expect(error).toHaveBeenCalled();
  });
});
