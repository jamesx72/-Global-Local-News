import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './hooks/useAuth.tsx';
import { SearchProvider } from './hooks/useSearch.tsx';
import { ThemeProvider } from './hooks/useTheme.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SearchProvider>
        <ThemeProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </ThemeProvider>
      </SearchProvider>
    </AuthProvider>
  </StrictMode>,
);

