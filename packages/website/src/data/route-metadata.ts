export interface RouteMetadata {
  path: string;
  title: string;
  description: string;
  titleZh: string;
  descriptionZh: string;
}

const LOCALE_PATH_PATTERN = /^\/(?:en-US|zh-CN)(?=\/|$)/;
const CHINESE_LOCALE_PATH_PATTERN = /^\/zh-CN(?=\/|$)/;

export const ROUTE_METADATA: RouteMetadata[] = [
  {
    path: '/',
    title: 'rx4u - Functional Reactive Programming',
    description: 'rx4u is a lightweight, pure functional reactive programming library for JavaScript and TypeScript.',
    titleZh: 'rx4u - 函数式响应式编程',
    descriptionZh: 'rx4u 是面向 JavaScript 和 TypeScript 的轻量级函数式响应式编程库。',
  },
  {
    path: '/docs/getting-started',
    title: 'Getting Started - rx4u',
    description: 'Install rx4u and build your first reactive stream with JavaScript or TypeScript.',
    titleZh: '快速开始 - rx4u',
    descriptionZh: '安装 rx4u，并使用 JavaScript 或 TypeScript 构建第一个响应式流。',
  },
  {
    path: '/docs/core-concepts',
    title: 'Core Concepts - rx4u',
    description: 'Learn the core reactive programming concepts behind rx4u streams, operators, and subscriptions.',
    titleZh: '核心概念 - rx4u',
    descriptionZh: '了解 rx4u 流、操作符和订阅背后的响应式编程核心概念。',
  },
  {
    path: '/docs/operators',
    title: 'Operators - rx4u',
    description: 'Explore rx4u operators for transforming, filtering, combining, and controlling streams.',
    titleZh: '操作符参考 - rx4u',
    descriptionZh: '浏览 rx4u 用于转换、过滤、组合和控制流的操作符。',
  },
  {
    path: '/api-reference',
    title: 'API Reference - rx4u',
    description: 'Browse the complete rx4u API reference for operators, creation functions, and utilities.',
    titleZh: 'API 参考 - rx4u',
    descriptionZh: '浏览 rx4u 操作符、创建函数和工具的完整 API 参考。',
  },
  {
    path: '/examples',
    title: 'Examples - rx4u',
    description: 'Explore practical rx4u examples and reactive programming patterns.',
    titleZh: '示例 - rx4u',
    descriptionZh: '浏览实用的 rx4u 示例和响应式编程模式。',
  },
  {
    path: '/playground',
    title: 'Playground - rx4u',
    description: 'Experiment with rx4u reactive programming examples directly in your browser.',
    titleZh: '在线练习场 - rx4u',
    descriptionZh: '直接在浏览器中体验 rx4u 响应式编程示例。',
  },
  {
    path: '/404',
    title: 'Page Not Found - rx4u',
    description: 'The requested rx4u page could not be found.',
    titleZh: '页面未找到 - rx4u',
    descriptionZh: '请求的 rx4u 页面不存在。',
  },
];

export function getRouteMetadata(pathname: string, language?: string): RouteMetadata {
  const isChinese = CHINESE_LOCALE_PATH_PATTERN.test(pathname) || language === 'zh-CN';
  const routePath = pathname.replace(LOCALE_PATH_PATTERN, '') || '/';
  const metadata = ROUTE_METADATA.find((route) => route.path === routePath) ?? ROUTE_METADATA.find((route) => route.path === '/404')!;

  return isChinese ? {...metadata, title: metadata.titleZh, description: metadata.descriptionZh} : metadata;
}
