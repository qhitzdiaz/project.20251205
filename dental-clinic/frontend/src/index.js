import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA
serviceWorkerRegistration.register({
  onSuccess: () => console.log('✅ PWA: Service worker registered successfully'),
  onUpdate: (registration) => {
    console.log('🔄 PWA: New content available, please refresh');
    // Optionally show a notification to the user
    if (window.confirm('New version available! Reload to update?')) {
      window.location.reload();
    }
  },
});
