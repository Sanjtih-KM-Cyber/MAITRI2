// src/index.tsx (MODIFIED)
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n'; // Initialize i18next
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppStateProvider } from './context/AppStateContext'; // NEW IMPORT

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// A simple loader that fits the app's theme, shown during initial load
const AppLoader: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#0A0A1A',
    color: 'var(--primary-accent-color)', // Use theme variable for aesthetic consistency
    fontFamily: 'var(--font-sans)',
    fontSize: '1.25rem'
  }} className="transition-colors duration-1000">
    Initializing MAITRI...
  </div>
);


const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Suspense fallback={<AppLoader />}>
      <SettingsProvider>
        <AppStateProvider>
            <ThemeProvider> 
                <App />
            </ThemeProvider>
        </AppStateProvider>
      </SettingsProvider>
    </Suspense>
  </React.StrictMode>
);