import {Router, Route} from '@solidjs/router';

import {LanguageProvider, type Language} from './components/LanguageProvider';
import {ThemeProvider} from './components/ThemeProvider';
import {AppLayout} from './layouts/AppLayout';
import {DocsLayout} from './layouts/DocsLayout';
import {HomePage} from './pages/HomePage';
import {APIReference} from './pages/APIReference';
import {ExamplesPage} from './pages/ExamplesPage';
import {NotFound} from './pages/NotFound';
import {PlaygroundPage} from './pages/PlaygroundPage';
import {GettingStarted} from './pages/docs/GettingStarted';
import {CoreConcepts} from './pages/docs/CoreConcepts';
import {Operators} from './pages/docs/Operators';

interface AppProps {
  url?: string;
}

export function App(props: AppProps) {
  return (
    <LanguageProvider initialLanguage={getInitialLanguage(props.url)}>
      <ThemeProvider>
        <Router base={getLocaleBase(props.url)} root={AppLayout} url={props.url}>
          <Route path="/" component={HomePage} />
          <Route path="/docs" component={DocsLayout}>
            <Route path="/getting-started" component={GettingStarted} />
            <Route path="/core-concepts" component={CoreConcepts} />
            <Route path="/operators" component={Operators} />
          </Route>
          <Route path="/api-reference" component={APIReferencePage} />
          <Route path="/examples" component={ExamplesPage} />
          <Route path="/playground" component={PlaygroundPage} />
          <Route path="/*" component={NotFound} />
        </Router>
      </ThemeProvider>
    </LanguageProvider>
  );
}

function getLocaleBase(url?: string): string | undefined {
  const pathname = url ?? (typeof window === 'undefined' ? undefined : window.location.pathname);

  return pathname?.match(/^\/(en-US|zh-CN)(?=\/|$)/)?.[0];
}

function getInitialLanguage(url?: string): Language {
  return getLocaleBase(url) === '/zh-CN' ? 'zh' : 'en';
}

function APIReferencePage() {
  return (
    <DocsLayout>
      <APIReference />
    </DocsLayout>
  );
}
