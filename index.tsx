import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n'; // Initialize i18next
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';

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
    color: '#EAEAEA',
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '1.25rem'
  }}>
    Initializing MAITRI...
  </div>
);


const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Suspense fallback={<AppLoader />}>
      <SettingsProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </SettingsProvider>
    </Suspense>
  </React.StrictMode>
);
