import {A} from '@solidjs/router';

import {useLanguage} from './LanguageProvider';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const {language} = useLanguage();
  const isChinese = () => language() === 'zh';

  return (
    <footer class="site-footer">
      <div class="footer-container">
        <div class="footer-grid">
          {/* Brand Section */}
          <div class="footer-brand">
            <div class="footer-brand-heading">
              <div class="brand-mark">
                <span>R</span>
              </div>
              <span>rx4u</span>
            </div>
            <p class="footer-description">
              {isChinese()
                ? '面向 JavaScript 和 TypeScript 的函数式响应式编程库。轻量、纯函数设计，灵感来自 RxJS。'
                : 'A functional reactive programming library for JavaScript and TypeScript. Lightweight, pure functional design inspired by RxJS.'}
            </p>
            <div class="footer-social-links">
              <a
                href="https://npmjs.com/package/rx4u"
                target="_blank"
                rel="noopener noreferrer"
                class="footer-social-link"
                title="npm"
              >
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M0 7v10h6.7v1.3H12V17h12V7H0zm6.7 8.7H5.3v-5.4H2V8.7h4.7v7zM12 15.7H8.7V8.7H12v7zm11.3 0h-1.4v-5.4h-1.3v5.4h-1.4v-5.4H17v5.4h-1.3V8.7h7.6v7z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Documentation Links */}
          <div class="footer-link-group">
            <h3>{isChinese() ? '文档' : 'Documentation'}</h3>
            <ul>
              <li>
                <A href="/docs/getting-started">
                  {isChinese() ? '快速开始' : 'Getting Started'}
                </A>
              </li>
              <li>
                <A href="/docs/core-concepts">
                  {isChinese() ? '核心概念' : 'Core Concepts'}
                </A>
              </li>
              <li>
                <A href="/docs/operators">
                  {isChinese() ? '操作符' : 'Operators'}
                </A>
              </li>
              <li>
                <A href="/api">
                  {isChinese() ? 'API 参考' : 'API Reference'}
                </A>
              </li>
            </ul>
          </div>

          {/* Project Links */}
          <div class="footer-link-group">
            <h3>{isChinese() ? '项目' : 'Project'}</h3>
            <ul>
              <li>
                <A href="/playground">
                  {isChinese() ? '练习场' : 'Playground'}
                </A>
              </li>
              <li>
                <A href="/examples">
                  {isChinese() ? '示例' : 'Examples'}
                </A>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div class="footer-bottom">
          <div class="footer-bottom-content">
            <p>© {currentYear} rx4u. {isChinese() ? '保留所有权利。' : 'All rights reserved.'}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
