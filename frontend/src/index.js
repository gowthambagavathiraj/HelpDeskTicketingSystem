import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ColorModeProvider } from './context/ThemeContext';
import './styles/globals.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ColorModeProvider>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--surface)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontSize: '14px',
                backdropFilter: 'blur(8px)',
              },
              success: { iconTheme: { primary: '#10b981', secondary: 'var(--bg)' } },
              error: { iconTheme: { primary: '#ef4444', secondary: 'var(--bg)' } },
            }}
          />
        </AuthProvider>
      </ColorModeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
