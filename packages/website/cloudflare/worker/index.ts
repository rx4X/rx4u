import {rewriteRequest} from './rewrite';
import {applyHeaders} from './headers';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (!env.ASSETS) {
      return new Response('ASSETS binding is missing!', {status: 500});
    }

    const result = rewriteRequest(request);
    if (result instanceof Response) {
      return result;
    }

    const response = await env.ASSETS.fetch(result);
    return applyHeaders(response);
  },
};
