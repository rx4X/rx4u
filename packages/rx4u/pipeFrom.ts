import type {Sub, Operator} from '@/types';

/**
 * Pipe function for composing operators from a source
 */
export function pipeFrom<T>(source: Sub<T>): Sub<T>;
export function pipeFrom<T, A>(source: Sub<T>, op1: Operator<T, A>): Sub<A>;
export function pipeFrom<T, A, B>(source: Sub<T>, op1: Operator<T, A>, op2: Operator<A, B>): Sub<B>;
export function pipeFrom<T, A, B, C>(source: Sub<T>, op1: Operator<T, A>, op2: Operator<A, B>, op3: Operator<B, C>): Sub<C>;
export function pipeFrom<T, A, B, C, D>(source: Sub<T>, op1: Operator<T, A>, op2: Operator<A, B>, op3: Operator<B, C>, op4: Operator<C, D>): Sub<D>;
export function pipeFrom<T, A, B, C, D, E>(source: Sub<T>, op1: Operator<T, A>, op2: Operator<A, B>, op3: Operator<B, C>, op4: Operator<C, D>, op5: Operator<D, E>): Sub<E>;
export function pipeFrom<T, A, B, C, D, E, F>(source: Sub<T>, op1: Operator<T, A>, op2: Operator<A, B>, op3: Operator<B, C>, op4: Operator<C, D>, op5: Operator<D, E>, op6: Operator<E, F>): Sub<F>;
export function pipeFrom<T, A, B, C, D, E, F, G>(
  source: Sub<T>,
  op1: Operator<T, A>,
  op2: Operator<A, B>,
  op3: Operator<B, C>,
  op4: Operator<C, D>,
  op5: Operator<D, E>,
  op6: Operator<E, F>,
  op7: Operator<F, G>
): Sub<G>;
export function pipeFrom<T, A, B, C, D, E, F, G, H>(
  source: Sub<T>,
  op1: Operator<T, A>,
  op2: Operator<A, B>,
  op3: Operator<B, C>,
  op4: Operator<C, D>,
  op5: Operator<D, E>,
  op6: Operator<E, F>,
  op7: Operator<F, G>,
  op8: Operator<G, H>
): Sub<H>;
export function pipeFrom<T, A, B, C, D, E, F, G, H, I>(
  source: Sub<T>,
  op1: Operator<T, A>,
  op2: Operator<A, B>,
  op3: Operator<B, C>,
  op4: Operator<C, D>,
  op5: Operator<D, E>,
  op6: Operator<E, F>,
  op7: Operator<F, G>,
  op8: Operator<G, H>,
  op9: Operator<H, I>
): Sub<I>;
export function pipeFrom<T, A, B, C, D, E, F, G, H, I, J>(
  source: Sub<T>,
  op1: Operator<T, A>,
  op2: Operator<A, B>,
  op3: Operator<B, C>,
  op4: Operator<C, D>,
  op5: Operator<D, E>,
  op6: Operator<E, F>,
  op7: Operator<F, G>,
  op8: Operator<G, H>,
  op9: Operator<H, I>,
  op10: Operator<I, J>
): Sub<J>;
export function pipeFrom<T>(source: Sub<T>, ...operators: Operator<any, any>[]): Sub<any> {
  return operators.reduce((prev, fn) => fn(prev), source);
}
