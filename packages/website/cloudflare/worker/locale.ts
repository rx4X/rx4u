const SUPPORTED_LOCALES = ['en-US', 'zh-CN'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en-US';

export const COOKIE_NAME = 'locale';

/**
 * Returns true if the request path starts with a supported locale.
 */
export function isLocalePath(pathname: string): boolean {
  return SUPPORTED_LOCALES.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
}

/**
 * Returns the locale stored in the locale cookie.
 */
export function getLocaleFromCookie(request: Request): Locale | undefined {
  const cookie = request.headers.get('Cookie');
  if (!cookie) {
    return;
  }

  const value = cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${COOKIE_NAME}=`))
    ?.split('=')[1];

  if (value && SUPPORTED_LOCALES.includes(value as Locale)) {
    return value as Locale;
  }
}

/**
 * Detect the preferred locale from the Accept-Language header.
 */
export function getLocaleFromHeader(request: Request): Locale {
  const header = request.headers.get('Accept-Language') ?? '';

  const languages = header.split(',').map((item) => item.split(';')[0].trim().toLowerCase());

  for (const language of languages) {
    if (language.startsWith('zh')) {
      return 'zh-CN';
    }

    if (language.startsWith('en')) {
      return 'en-US';
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Resolve the preferred locale.
 *
 * Priority:
 * 1. Cookie
 * 2. Accept-Language
 * 3. Default locale
 */
export function detectLocale(request: Request): Locale {
  return getLocaleFromCookie(request) ?? getLocaleFromHeader(request);
}
