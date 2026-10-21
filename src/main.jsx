import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Bundled rather than loaded from Google Fonts: the studio makes no network requests without an
// account, and the desktop app has to look right offline.
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
