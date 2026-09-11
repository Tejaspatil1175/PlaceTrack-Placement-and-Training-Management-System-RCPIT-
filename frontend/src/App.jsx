import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-base text-text-primary">
      <header className="bg-primary-900 text-white px-6 py-4 border-b border-primary-700 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-accent-500 flex items-center justify-center font-heading font-bold text-white shadow-sm">
              PT
            </div>
            <div>
              <h1 className="font-heading text-lg font-semibold tracking-tight text-white">
                PlaceTrack
              </h1>
              <p className="text-xs text-primary-100/80">
                R.C. Patel Institute of Technology, Shirpur
              </p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary-700 text-primary-100 border border-primary-500">
            Frontend Scaffold v1.0
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <div className="bg-bg-surface p-8 rounded-xl border border-border-subtle shadow-sm max-w-2xl mx-auto my-12 text-center">
          <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mx-auto mb-4 font-heading font-semibold text-lg">
            ✓
          </div>
          <h2 className="font-heading text-2xl font-semibold text-primary-900 mb-2">
            PlaceTrack App Shell Ready
          </h2>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            Single unified React application scaffolded with Vite, Tailwind CSS, React Router v6, TanStack Query, and Axios JWT Interceptors.
          </p>
          <div className="inline-flex items-center space-x-2 text-xs font-mono bg-bg-base px-4 py-2 rounded-md border border-border-subtle text-text-muted">
            <span>Tailwind Custom Tokens & Fonts (Sora / Inter) Loaded</span>
          </div>
        </div>
      </main>

      <footer className="bg-bg-surface border-t border-border-subtle py-4 text-center text-xs text-text-muted">
        © 2026 PlaceTrack — Training & Placement Cell, RCPIT Shirpur.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<AppShell />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
