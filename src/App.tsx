/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Context Wrapper
import { AppContextProvider, useApp } from './context/AppContext';

// Sidebar Navigation
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Tasks from './pages/Tasks';
import Progress from './pages/Progress';
import Search from './pages/Search';
import Settings from './pages/Settings';

// Inner Layout that applies current active themes
function LayoutThemeWrapper() {
  const { theme, currentUser } = useApp();

  // Keep HTML root aligned with current theme classes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#0F172A';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = theme === 'warm' ? '#FAF6F0' : '#F8FAFC';
    }
  }, [theme]);

  // If unauthorized, push to login landing
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`flex flex-col md:flex-row min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'dark bg-[#0F172A] text-slate-100'
      : theme === 'warm' ? 'bg-[#FAF6F0] text-amber-955'
      : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Sidebar - collapsible on desktop, drawer on mobile */}
      <Sidebar />

      {/* Main viewport area */}
      <main className="flex-1 overflow-y-auto px-3 py-4 sm:p-5 md:p-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}

// Simple Router definitions
export default function App() {
  return (
    <AppContextProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login */}
          <Route path="/login" element={<Login />} />

          {/* Connected Layout & Routes */}
          <Route element={<LayoutThemeWrapper />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/search" element={<Search />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Catch-all Routing redirects */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppContextProvider>
  );
}
