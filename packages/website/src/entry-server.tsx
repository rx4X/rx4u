import {generateHydrationScript, renderToString} from 'solid-js/web';

import {App} from './App';

export function render(url: string) {
  return renderToString(() => <App url={url} />);
}

export function renderHydrationScript() {
  return generateHydrationScript();
}
