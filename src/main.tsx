import './index.css';
import { bootTheme } from './themeBoot';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

bootTheme();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
