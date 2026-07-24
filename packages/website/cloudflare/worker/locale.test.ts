import {describe, expect, it} from 'vitest';

import {DEFAULT_LOCALE, detectLocale, getLocaleFromCookie, getLocaleFromHeader, isLocalePath} from './locale';

describe('isLocalePath', () => {
  it('matches locale roots and localized paths', () => {
    expect(isLocalePath('/en-US')).toBe(true);
    expect(isLocalePath('/zh-CN/docs')).toBe(true);
  });

  it('does not match locale-like paths', () => {
    expect(isLocalePath('/zh-CN-guide')).toBe(false);
    expect(isLocalePath('/docs')).toBe(false);
  });
});

describe('getLocaleFromCookie', () => {
  it('returns a supported locale from the locale cookie', () => {
    const request = new Request('https://rx4u.dev', {
      headers: {Cookie: 'theme=dark; locale=zh-CN'},
    });

    expect(getLocaleFromCookie(request)).toBe('zh-CN');
  });

  it('ignores an unsupported locale cookie', () => {
    const request = new Request('https://rx4u.dev', {
      headers: {Cookie: 'locale=fr-FR'},
    });

    expect(getLocaleFromCookie(request)).toBeUndefined();
  });
});

describe('getLocaleFromHeader', () => {
  it('matches Chinese and English language tags', () => {
    expect(getLocaleFromHeader(new Request('https://rx4u.dev', {headers: {'Accept-Language': 'zh-TW,en;q=0.8'}}))).toBe('zh-CN');
    expect(getLocaleFromHeader(new Request('https://rx4u.dev', {headers: {'Accept-Language': 'en-GB'}}))).toBe('en-US');
  });

  it('uses the default locale for unsupported or missing language tags', () => {
    expect(getLocaleFromHeader(new Request('https://rx4u.dev', {headers: {'Accept-Language': 'fr-FR'}}))).toBe(DEFAULT_LOCALE);
    expect(getLocaleFromHeader(new Request('https://rx4u.dev'))).toBe(DEFAULT_LOCALE);
  });
});

describe('detectLocale', () => {
  it('uses the cookie before the Accept-Language header', () => {
    const request = new Request('https://rx4u.dev', {
      headers: {
        'Accept-Language': 'zh-CN',
        Cookie: 'locale=en-US',
      },
    });

    expect(detectLocale(request)).toBe('en-US');
  });
});
