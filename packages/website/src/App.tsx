import {Router, Route} from '@solidjs/router';
import {lazy} from 'solid-js';

import {LanguageProvider} from './components/LanguageProvider';
import {ThemeProvider} from './components/ThemeProvider';
import {AppLayout} from './layouts/AppLayout';
import {DocsLayout} from './layouts/DocsLayout';
import {HomePage} from './pages/HomePage';
import {APIReference} from './pages/APIReference';
import {ExamplesPage} from './pages/ExamplesPage';
import {NotFound} from './pages/NotFound';
import {GettingStarted} from './pages/docs/GettingStarted';
import {CoreConcepts} from './pages/docs/CoreConcepts';
import {Operators} from './pages/docs/Operators';

const PlaygroundPage = lazy(loadPlaygroundPage);

interface AppProps {
  url?: string;
}

export function App(props: AppProps) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Router root={AppLayout} url={props.url}>
          <Route path="/" component={HomePage} />
          <Route path="/docs" component={DocsLayout}>
            <Route path="/getting-started" component={GettingStarted} />
            <Route path="/core-concepts" component={CoreConcepts} />
            <Route path="/operators" component={Operators} />
          </Route>
          <Route path="/api" component={APIReferencePage} />
          <Route path="/examples" component={ExamplesPage} />
          <Route path="/playground" component={PlaygroundPage} />
          <Route path="/*" component={NotFound} />
        </Router>
      </ThemeProvider>
    </LanguageProvider>
  );
}

function APIReferencePage() {
  return (
    <DocsLayout>
      <APIReference />
    </DocsLayout>
  );
}

function loadPlaygroundPage() {
  return import('./pages/PlaygroundPage').then(({PlaygroundPage}) => ({default: PlaygroundPage}));
}
