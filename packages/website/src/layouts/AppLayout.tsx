import type {ParentProps} from 'solid-js';
import {Navigation} from '../components/Navigation';
import {Footer} from '../components/Footer';

export function AppLayout(props: ParentProps) {
  return (
    <div class="app-layout">
      <Navigation />
      <main class="app-content">{props.children}</main>
      <Footer />
    </div>
  );
}
