import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import AOS from 'aos'

// Initialize AOS
AOS.init({
  duration: 800,
  once: true,
  offset: 100
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
