import {detectLocale, isLocalePath} from './locale';

/**
 * Normalize request URLs.
 */
export function rewriteRequest(request: Request): Request | Response {
  const url = new URL(request.url);

  // Redirect "/foo/" -> "/foo".
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
    return Response.redirect(url.toString(), 308);
  }

  // Skip static assets that do not have a locale prefix.
  if (url.pathname.includes('.') && !isLocalePath(url.pathname)) {
    return request;
  }

  // Redirect page requests to the preferred locale.
  if (!isLocalePath(url.pathname)) {
    const locale = detectLocale(request);
    url.pathname = url.pathname === '/' ? `/${locale}` : `/${locale}${url.pathname}`;
    return Response.redirect(url.toString(), 302);
  }

  const localePath = url.pathname.replace(/^\/(?:en-US|zh-CN)(?=\/|$)/, '') || '/';

  // Serve locale-prefixed static assets from their original paths.
  if (localePath.includes('.')) {
    url.pathname = localePath;
    return new Request(url, request);
  }

  // Rewrite page requests to their localized index.html file.
  url.pathname += '/index.html';

  return new Request(url, request);
}
