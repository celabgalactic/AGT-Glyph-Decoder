import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { polyfillCountryFlagEmojis } from 'country-flag-emoji-polyfill';
import App from './App.tsx';
import './index.css';

polyfillCountryFlagEmojis();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
