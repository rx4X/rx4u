import {describe, expect, it} from 'vitest';
import {rewriteRequest} from './rewrite';

describe('rewriteRequest', () => {
  it('rewrites a localized page URL to its SSG index file', () => {
    const result = rewriteRequest(new Request('https://rx4u.dev/en-US'));

    expect(result).toBeInstanceOf(Request);
    expect(new URL((result as Request).url).pathname).toBe('/en-US/index.html');
  });

  it('redirects a localized directory URL to the canonical page URL', () => {
    const result = rewriteRequest(new Request('https://rx4u.dev/en-US/'));

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(308);
    expect((result as Response).headers.get('Location')).toBe('https://rx4u.dev/en-US');
  });

  it('redirects a Chinese localized directory URL to the canonical page URL', () => {
    const result = rewriteRequest(new Request('https://rx4u.dev/zh-CN/'));

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(308);
    expect((result as Response).headers.get('Location')).toBe('https://rx4u.dev/zh-CN');
  });

  it('redirects the root URL to the localized page URL', () => {
    const result = rewriteRequest(new Request('https://rx4u.dev/'));

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get('Location')).toBe('https://rx4u.dev/en-US');
  });

  it('uses the preferred locale for unlocalized page URLs', () => {
    const result = rewriteRequest(
      new Request('https://rx4u.dev/docs?tab=api', {
        headers: {'Accept-Language': 'zh-CN'},
      })
    );

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get('Location')).toBe('https://rx4u.dev/zh-CN/docs?tab=api');
  });

  it('prefers the locale cookie over the request header', () => {
    const result = rewriteRequest(
      new Request('https://rx4u.dev/docs', {
        headers: {
          'Accept-Language': 'zh-CN',
          Cookie: 'locale=en-US',
        },
      })
    );

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get('Location')).toBe('https://rx4u.dev/en-US/docs');
  });

  it('serves localized static assets from their unlocalized paths', () => {
    const result = rewriteRequest(new Request('https://rx4u.dev/zh-CN/assets/main.js'));

    expect(result).toBeInstanceOf(Request);
    expect(new URL((result as Request).url).pathname).toBe('/assets/main.js');
  });

  it('leaves unlocalized static assets unchanged', () => {
    const request = new Request('https://rx4u.dev/assets/main.js');

    expect(rewriteRequest(request)).toBe(request);
  });
});
