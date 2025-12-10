import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Workbox } from 'workbox-window';
import App from './components/App';
import '../css/app.css';

const rootElement = document.getElementById('react-app');

if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
        <StrictMode>
            <App />
        </StrictMode>
    );
}

// Register service worker for PWA
if ('serviceWorker' in navigator) {
    const wb = new Workbox('/sw.js');

    wb.addEventListener('installed', (event) => {
        if (event.isUpdate) {
            // New service worker available
            if (confirm('New version available! Reload to update?')) {
                window.location.reload();
            }
        } else {
            // Service worker installed for the first time
            console.log('Service worker installed');
        }
    });

    wb.addEventListener('waiting', () => {
        // Service worker is waiting to activate
        if (confirm('New version available! Reload to update?')) {
            wb.messageSkipWaiting();
        }
    });

    wb.addEventListener('controlling', () => {
        // Service worker is now controlling the page
        window.location.reload();
    });

    wb.register();
}

