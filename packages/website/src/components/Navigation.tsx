import {createSignal, Show} from 'solid-js';
import {A, useLocation} from '@solidjs/router';
import {GlobalSearch} from './GlobalSearch';
import {LanguageToggle} from './LanguageToggle';
import {useLanguage} from './LanguageProvider';
import {useTheme} from './ThemeProvider';

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);
  const {language} = useLanguage();
  const {theme, toggleTheme} = useTheme();
  const location = useLocation();

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navItems = [
    {path: '/', label: () => language() === 'zh' ? '首页' : 'Home'},
    {path: '/examples', label: () => language() === 'zh' ? '示例' : 'Examples'},
    {path: '/playground', label: () => language() === 'zh' ? '练习场' : 'Playground'},
  ];

  const documentationItems = [
    {path: '/docs/getting-started', label: () => language() === 'zh' ? '快速开始' : 'Getting Started'},
    {path: '/docs/core-concepts', label: () => language() === 'zh' ? '核心概念' : 'Core Concepts'},
    {path: '/docs/operators', label: () => language() === 'zh' ? '操作符' : 'Operators'},
    {path: '/api', label: () => language() === 'zh' ? 'API 参考' : 'API Reference'},
  ];

  const isDocumentationActive = () => location.pathname.startsWith('/docs') || location.pathname === '/api';

  return (
    <nav class="site-navigation">
      <div class="navigation-container">
        <div class="navigation-bar">
          {/* Logo and Brand */}
          <div class="navigation-brand">
            <A href="/" class="brand-link">
              <div class="brand-mark">
                <span>R</span>
              </div>
              <span>rx4u</span>
            </A>
          </div>

          {/* Desktop Navigation */}
          <div class="navigation-desktop-links">
            <A href={navItems[0].path} class={`navigation-link ${isActivePath(navItems[0].path) ? 'is-active' : ''}`}>
              {navItems[0].label()}
            </A>

            <div class="navigation-documentation-menu">
              <A href="/docs/getting-started" class={`navigation-link ${isDocumentationActive() ? 'is-active' : ''}`}>
                {language() === 'zh' ? '文档' : 'Documentation'}
              </A>

              <div class="navigation-documentation-dropdown">
                <div>
                  {documentationItems.map((item) => (
                    <A href={item.path} class={`navigation-documentation-link ${isActivePath(item.path) ? 'is-active' : ''}`}>
                      {item.label()}
                    </A>
                  ))}
                </div>
              </div>
            </div>

            {navItems.slice(1).map((item) => (
              <A href={item.path} class={`navigation-link ${isActivePath(item.path) ? 'is-active' : ''}`}>
                {item.label()}
              </A>
            ))}
            {/* Search */}
            <GlobalSearch />
            <LanguageToggle />
            {/* GitHub Link */}
            <a
              href="https://github.com/rx4X/rx4u"
              target="_blank"
              rel="noopener noreferrer"
              class="navigation-icon-link"
              title={language() === 'zh' ? '在 GitHub 查看' : 'View on GitHub'}
            >
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              class="navigation-theme-button"
              title={language() === 'zh' ? `切换到${theme() === 'light' ? '深色' : '浅色'}模式` : `Switch to ${theme() === 'light' ? 'dark' : 'light'} mode`}
            >
              <Show
                when={theme() === 'light'}
                fallback={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4" stroke-width="2" />
                    <path stroke-linecap="round" stroke-width="2" d="M12 2v2m0 16v2m10-10h-2M4 12H2m17.071-7.071l-1.414 1.414M6.343 17.657l-1.414 1.414m14.142 0l-1.414-1.414M6.343 6.343L4.929 4.929" />
                  </svg>
                }
              >
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              </Show>
            </button>
          </div>

          {/* Mobile menu button */}
          <div class="navigation-mobile-toggle">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen())} class="icon-button" aria-label={language() === 'zh' ? '切换移动导航菜单' : 'Toggle mobile menu'}>
              <Show
                when={!isMobileMenuOpen()}
                fallback={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Show>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <Show when={isMobileMenuOpen()}>
          <div class="navigation-mobile-menu">
            <div class="navigation-mobile-links">
              <A
                href={navItems[0].path}
                class={`navigation-link ${isActivePath(navItems[0].path) ? 'is-active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {navItems[0].label()}
              </A>
              <A
                href="/docs/getting-started"
                class={`navigation-link ${isDocumentationActive() ? 'is-active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {language() === 'zh' ? '文档' : 'Documentation'}
              </A>
              {navItems.slice(1).map((item) => (
                <A
                  href={item.path}
                  class={`navigation-link ${isActivePath(item.path) ? 'is-active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label()}
                </A>
              ))}

              <div class="navigation-mobile-actions">
                <LanguageToggle />
                <button onClick={toggleTheme} class="theme-text-button">
                  {language() === 'zh' ? `${theme() === 'light' ? '深色' : '浅色'}模式` : `${theme() === 'light' ? 'Dark' : 'Light'} Mode`}
                </button>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </nav>
  );
}
