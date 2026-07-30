import {generateHydrationScript, renderToStringAsync} from 'solid-js/web';

import {App} from './App';

export {getRouteMetadata, ROUTE_METADATA} from './data/route-metadata';

export async function render(url: string) {
  return renderToStringAsync(() => <App url={url} />);
}

export function renderHydrationScript() {
  return generateHydrationScript();
}
