export function applyHeaders(response: Response): Response {
  const headers = new Headers(response.headers);

  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
