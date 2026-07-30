import type {ParentProps} from 'solid-js';
import {Navigation} from '../components/Navigation';
import {Footer} from '../components/Footer';
import {RouteMetadata} from '../components/RouteMetadata';

export function AppLayout(props: ParentProps) {
  return (
    <div class="app-layout">
      <RouteMetadata />
      <Navigation />
      <main class="app-content">{props.children}</main>
      <Footer />
    </div>
  );
}
