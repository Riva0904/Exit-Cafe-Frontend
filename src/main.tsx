import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.tsx';
import { store } from './app/store';
import { queryClient } from './app/queryClient';
import { ThemeSync } from './app/ThemeSync';
import { AuthEventListener } from './app/AuthEventListener';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeSync />
          <AuthEventListener />
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#14111a', color: '#f5efe2', border: '1px solid rgba(212,175,55,0.2)' },
            }}
          />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
