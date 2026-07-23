import {A} from '@solidjs/router';

import {useLanguage} from '../components/LanguageProvider';

export function NotFound() {
  const {language} = useLanguage();

  return (
    <div class="not-found-page">
      <div class="not-found-content">
        <h1>404</h1>
        <p>{language() === 'zh' ? '页面未找到' : 'Page not found'}</p>
        <A href="/" class="btn-primary">
          {language() === 'zh' ? '返回首页' : 'Go Home'}
        </A>
      </div>
    </div>
  );
}
