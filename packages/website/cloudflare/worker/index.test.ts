import {describe, expect, it, vi} from 'vitest';

import worker from './index';

describe('worker fetch', () => {
  it('returns a server error when the assets binding is unavailable', async () => {
    const response = await worker.fetch(new Request('https://rx4u.dev/'), {} as Env);

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.toBe('ASSETS binding is missing!');
  });

  it('returns redirects without fetching assets', async () => {
    const fetch = vi.fn();
    const response = await worker.fetch(new Request('https://rx4u.dev/'), {ASSETS: {fetch}} as Env);

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('https://rx4u.dev/en-US');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('fetches rewritten assets and applies security headers', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('page', {headers: {'Content-Type': 'text/html'}}));
    const response = await worker.fetch(new Request('https://rx4u.dev/en-US'), {ASSETS: {fetch}} as Env);

    expect(fetch).toHaveBeenCalledOnce();
    expect(new URL(fetch.mock.calls[0][0].url).pathname).toBe('/en-US/index.html');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    await expect(response.text()).resolves.toBe('page');
  });
});
