import {mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const DIRECTORY_PATH = dirname(fileURLToPath(import.meta.url));
const WEBSITE_PATH = dirname(DIRECTORY_PATH);
const DIST_PATH = join(WEBSITE_PATH, 'dist');
const SERVER_PATH = join(DIST_PATH, 'server', 'entry-server.js');
const ROUTES = [
  {
    path: '/',
    title: 'rx4u - Functional Reactive Programming',
    description: 'rx4u is a lightweight, pure functional reactive programming library for JavaScript and TypeScript.',
  },
  {
    path: '/docs/getting-started',
    title: 'Getting Started - rx4u',
    description: 'Install rx4u and build your first reactive stream with JavaScript or TypeScript.',
  },
  {
    path: '/docs/core-concepts',
    title: 'Core Concepts - rx4u',
    description: 'Learn the core reactive programming concepts behind rx4u streams, operators, and subscriptions.',
  },
  {
    path: '/docs/operators',
    title: 'Operators - rx4u',
    description: 'Explore rx4u operators for transforming, filtering, combining, and controlling streams.',
  },
  {
    path: '/api',
    title: 'API Reference - rx4u',
    description: 'Browse the complete rx4u API reference for operators, creation functions, and utilities.',
  },
  {
    path: '/examples',
    title: 'Examples - rx4u',
    description: 'Explore practical rx4u examples and reactive programming patterns.',
  },
  {
    path: '/playground',
    title: 'Playground - rx4u',
    description: 'Experiment with rx4u reactive programming examples directly in your browser.',
  },
  {
    path: '/404',
    title: 'Page Not Found - rx4u',
    description: 'The requested rx4u page could not be found.',
  },
];
const LOCALES = ['en-US', 'zh-CN'];
const LOCALIZED_ROUTES = [];

for (const locale of LOCALES) {
  for (const route of ROUTES) {
    if (route.path !== '/404') {
      LOCALIZED_ROUTES.push({
        ...route,
        path: route.path === '/' ? `/${locale}` : `/${locale}${route.path}`,
      });
    }
  }
}

const template = await readFile(join(DIST_PATH, 'index.html'), 'utf8');
const {render, renderHydrationScript} = await import(pathToFileURL(SERVER_PATH).href);

await Promise.all([...ROUTES, ...LOCALIZED_ROUTES].map(writeRoute));
await rm(join(DIST_PATH, 'server'), {recursive: true, force: true});

async function writeRoute(route) {
  const appHtml = render(route.path);
  const html = template
    .replace('</head>', `${renderHydrationScript()}</head>`)
    .replace('<title>rx4u - Functional Reactive Programming</title>', `<title>${route.title}</title>`)
    .replace('content="rx4u - Functional Reactive Programming library for JavaScript and TypeScript. A lightweight, pure functional alternative to RxJS."', `content="${route.description}"`)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
  const outputPath = route.path === '/' ? join(DIST_PATH, 'index.html') : route.path === '/404' ? join(DIST_PATH, '404.html') : join(DIST_PATH, route.path.slice(1), 'index.html');

  await mkdir(dirname(outputPath), {recursive: true});
  await writeFile(outputPath, html);
}
