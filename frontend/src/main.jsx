import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#111e35',
            color: '#f0f4ff',
            border: '1px solid #2a4268',
            borderRadius: '0.75rem',
            fontFamily: "'Cairo', 'Inter', sans-serif",
            fontSize: '0.9rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#111e35' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#111e35' },
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
