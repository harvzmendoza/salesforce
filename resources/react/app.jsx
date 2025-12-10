import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
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

