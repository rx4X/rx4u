import {createSignal, Show, For, type ParentProps, type Component} from 'solid-js';
import {A, useLocation} from '@solidjs/router';
import {useLanguage} from '../components/LanguageProvider';
import {docsNavigation, NavItem} from '../data/navigation';

export function DocsLayout(props: ParentProps) {
  const [isSidebarOpen, setIsSidebarOpen] = createSignal(false);
  const {language} = useLanguage();
  const location = useLocation();

  const NavItemComponent: Component<{item: NavItem; level?: number}> = (props) => {
    const level = () => props.level || 0;
    const isActive = () => location.pathname === props.item.href;
    const hasActiveChild = () => {
      if (!props.item.children) return false;
      return props.item.children.some((child) => location.pathname === child.href);
    };

    return (
      <div class="docs-nav-item">
        <A
          href={props.item.href}
          class={`docs-nav-link ${level() > 0 ? 'is-nested' : ''} ${isActive() ? 'is-active' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        >
          {language() === 'zh' ? props.item.titleZh : props.item.title}
        </A>
        <Show when={props.item.children && (hasActiveChild() || isActive())}>
          <div class="docs-nav-children">
            <For each={props.item.children}>{(child) => <NavItemComponent item={child} level={level() + 1} />}</For>
          </div>
        </Show>
      </div>
    );
  };

  return (
    <div class="docs-layout">
      <div class="docs-container">
        <div class="docs-shell">
          {/* Mobile sidebar toggle */}
          <div class="docs-mobile-toggle">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen())}
              class="icon-button"
              aria-label={language() === 'zh' ? '切换文档侧边栏' : 'Toggle sidebar'}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <Show when={!isSidebarOpen()} fallback={<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />}>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </Show>
              </svg>
            </button>
          </div>

          {/* Sidebar */}
          <aside
            class={`docs-sidebar ${isSidebarOpen() ? 'is-open' : ''}`}
          >
            <div class="docs-sidebar-content">
              <h2>{language() === 'zh' ? '文档' : 'Documentation'}</h2>
              <nav>
                <For each={docsNavigation}>{(item) => <NavItemComponent item={item} />}</For>
              </nav>
            </div>
          </aside>

          {/* Sidebar overlay for mobile */}
          <Show when={isSidebarOpen()}>
            <div class="docs-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
          </Show>

          {/* Main content */}
          <main class="docs-main">
            <div class="docs-article-container">{props.children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
