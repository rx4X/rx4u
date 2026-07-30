import {mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const DIRECTORY_PATH = dirname(fileURLToPath(import.meta.url));
const WEBSITE_PATH = dirname(DIRECTORY_PATH);
const DIST_PATH = join(WEBSITE_PATH, 'dist');
const SERVER_PATH = join(DIST_PATH, 'server', 'entry-server.js');
const template = await readFile(join(DIST_PATH, 'index.html'), 'utf8');
const {getRouteMetadata, render, renderHydrationScript, ROUTE_METADATA} = await import(pathToFileURL(SERVER_PATH).href);
const LOCALES = ['en-US', 'zh-CN'];
const LOCALIZED_ROUTES = [];

for (const locale of LOCALES) {
  for (const route of ROUTE_METADATA) {
    if (route.path !== '/404') {
      const path = route.path === '/' ? `/${locale}` : `/${locale}${route.path}`;

      LOCALIZED_ROUTES.push({
        ...route,
        ...getRouteMetadata(path),
        path,
        language: locale === 'zh-CN' ? 'zh-CN' : 'en',
      });
    }
  }
}

await Promise.all([...ROUTE_METADATA, ...LOCALIZED_ROUTES].map(writeRoute));
await rm(join(DIST_PATH, 'server'), {recursive: true, force: true});

async function writeRoute(route) {
  const appHtml = await render(route.path);
  const html = template
    .replace('<html lang="en">', `<html lang="${route.language ?? 'en'}">`)
    .replace('</head>', `${renderHydrationScript()}</head>`)
    .replace('<title>rx4u - Functional Reactive Programming</title>', `<title>${route.title}</title>`)
    .replace('content="rx4u - Functional Reactive Programming library for JavaScript and TypeScript. A lightweight, pure functional alternative to RxJS."', `content="${route.description}"`)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
  const outputPath = route.path === '/' ? join(DIST_PATH, 'index.html') : route.path === '/404' ? join(DIST_PATH, '404.html') : join(DIST_PATH, route.path.slice(1), 'index.html');

  await mkdir(dirname(outputPath), {recursive: true});
  await writeFile(outputPath, html);
}
