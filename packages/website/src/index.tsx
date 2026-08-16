import {hydrate} from 'solid-js/web';
import {App} from './App';
import './styles/globals.css';

const GTM_ID = 'GTM-TC2K79ZW';
const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error('Root element not found.');
}

if (import.meta.env.PROD) {
  const gtmWindow = window as Window & {
    dataLayer?: Array<Record<string, number | string>>;
  };
  const dataLayer = (gtmWindow.dataLayer ||= []);
  dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });

  const firstScript = document.getElementsByTagName('script')[0];
  const gtmScript = document.createElement('script');
  gtmScript.async = true;
  gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  firstScript.parentNode?.insertBefore(gtmScript, firstScript);
}

hydrate(() => <App />, root!);
