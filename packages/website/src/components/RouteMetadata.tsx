import {createEffect} from 'solid-js';
import {useLocation} from '@solidjs/router';

import {getRouteMetadata} from '../data/route-metadata';

export function RouteMetadata() {
  const location = useLocation();

  createEffect(() => {
    const metadata = getRouteMetadata(location.pathname, document.documentElement.lang);
    const description = document.querySelector('meta[name="description"]');

    document.title = metadata.title;
    description?.setAttribute('content', metadata.description);
  });

  return null;
}
