export interface NavItem {
  title: string;
  titleZh: string;
  href: string;
  description?: string;
  descriptionZh?: string;
  children?: NavItem[];
}

export const docsNavigation: NavItem[] = [
  {
    title: 'Getting Started',
    titleZh: '快速开始',
    href: '/docs/getting-started',
    description: 'Quick introduction and setup guide',
    descriptionZh: '快速介绍和安装指南',
  },
  {
    title: 'Core Concepts',
    titleZh: '核心概念',
    href: '/docs/core-concepts',
    description: 'Understanding streams, operators, and composition',
    descriptionZh: '理解流、操作符和组合',
  },
  {
    title: 'Operators',
    titleZh: '操作符',
    href: '/docs/operators',
    description: 'Transform and manipulate streams',
    descriptionZh: '转换和处理流',
  },
  {
    title: 'API Reference',
    titleZh: 'API 参考',
    href: '/api-reference',
    description: 'Search available functions and operators',
    descriptionZh: '查询可用函数和操作符',
  },
];

export const findNavItem = (href: string): NavItem | undefined => {
  const search = (items: NavItem[]): NavItem | undefined => {
    for (const item of items) {
      if (item.href === href) return item;
      if (item.children) {
        const found = search(item.children);
        if (found) return found;
      }
    }
    return undefined;
  };
  return search(docsNavigation);
};
