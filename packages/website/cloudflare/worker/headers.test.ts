import {describe, expect, it} from 'vitest';

import {applyHeaders} from './headers';

describe('applyHeaders', () => {
  it('preserves the response and adds security headers', async () => {
    const response = new Response('content', {
      headers: {'Content-Type': 'text/plain'},
      status: 201,
    });

    const result = applyHeaders(response);

    expect(result.status).toBe(201);
    expect(result.headers.get('Content-Type')).toBe('text/plain');
    expect(result.headers.get('X-Frame-Options')).toBe('DENY');
    expect(result.headers.get('X-Content-Type-Options')).toBe('nosniff');
    await expect(result.text()).resolves.toBe('content');
  });
});
