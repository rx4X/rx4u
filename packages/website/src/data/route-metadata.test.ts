import {describe, expect, it} from 'vitest';

import {getRouteMetadata} from './route-metadata';

describe('getRouteMetadata', () => {
  it('returns metadata for a public route', () => {
    expect(getRouteMetadata('/docs/getting-started')).toMatchObject({
      title: 'Getting Started - rx4u',
    });
  });

  it('returns metadata for the API reference route', () => {
    expect(getRouteMetadata('/api-reference')).toMatchObject({
      title: 'API Reference - rx4u',
    });
  });

  it('returns metadata for a localized public route', () => {
    expect(getRouteMetadata('/zh-CN/docs/getting-started')).toMatchObject({
      title: '快速开始 - rx4u',
      description: '安装 rx4u，并使用 JavaScript 或 TypeScript 构建第一个响应式流。',
    });
  });

  it('uses the document language when the router removes the locale prefix', () => {
    expect(getRouteMetadata('/docs/getting-started', 'zh-CN')).toMatchObject({
      title: '快速开始 - rx4u',
    });
  });

  it('returns the not-found metadata for an unknown route', () => {
    expect(getRouteMetadata('/missing')).toMatchObject({
      title: 'Page Not Found - rx4u',
    });
  });
});
