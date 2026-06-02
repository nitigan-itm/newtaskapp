/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Search,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const { currentUser, logout, theme } = useApp();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Progress', path: '/progress', icon: TrendingUp },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Render initials avatar with custom background color
  const renderAvatar = (name: string, sizeClass = "w-9 h-9 text-xs") => {
    const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-violet-600'];
    const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorClass = colors[charCodeSum % colors.length];
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    return (
      <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-white/10 ${colorClass}`}>
        {initials}
      </div>
    );
  };

  const sidebarContent = (
    <div className={`h-full flex flex-col justify-between py-3.5 ${
      theme === 'dark' ? 'bg-[#0F172A] text-slate-100 border-r border-slate-805' 
      : theme === 'warm' ? 'bg-[#1C1917] text-amber-50/90 border-r border-[#2E2A24]'
      : 'bg-[#0F172A] text-slate-100 border-r border-slate-200'
    }`}>
      <div>
        {/* Logo and branding */}
        <div className="px-5 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <span className="font-bold text-lg tracking-tight text-white">
                TaskFlow
              </span>
            )}
          </div>
          
          {/* Collapse toggle (Desktop only) */}
          {!isMobileOpen && (
            <button
              id="desktop-collapse-btn"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                id={`nav-${item.name.toLowerCase()}`}
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-150 font-medium text-xs ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`
                }
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {(!isCollapsed || isMobileOpen) && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs"
                  >
                    {item.name}
                  </motion.span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / User information */}
      <div className="px-3 space-y-2">
        {currentUser && (
          <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg flex items-center gap-2.5">
            {renderAvatar(currentUser.name, "w-7 h-7 text-[10px]")}
            {(!isCollapsed || isMobileOpen) && (
              <div className="overflow-hidden min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{currentUser.role}</p>
              </div>
            )}
          </div>
        )}

        <button
          id="logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-400 hover:text-red-300 hover:bg-red-950/20 font-medium text-xs transition-all duration-150"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {(!isCollapsed || isMobileOpen) && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className={`md:hidden flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${
        theme === 'dark' ? 'bg-[#0F172A] border-slate-800 text-white' 
        : theme === 'warm' ? 'bg-[#FAF6F0] border-[#EBE3D5] text-amber-950'
        : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#2563EB] flex items-center justify-center text-white shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="font-bold text-base tracking-tight text-[#0F172A] dark:text-white">
            TaskFlow
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {currentUser && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
              {renderAvatar(currentUser.name, "w-6 h-6 text-[9px]")}
              <span className="text-xs font-semibold mr-1 max-w-[80px] truncate">{currentUser.name.split(' ')[0]}</span>
            </div>
          )}
          <button
            id="mobile-nav-toggle"
            onClick={() => setIsMobileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar container */}
      <aside className={`hidden md:block transition-all duration-300 flex-shrink-0 h-screen ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        {sidebarContent}
      </aside>

      {/* Mobile Slide-out Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />
            {/* Drawer Body */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-72 max-w-[80vw] h-full flex flex-col z-10"
            >
              <button
                id="mobile-nav-close"
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-[-45px] p-2 bg-indigo-900 text-white rounded-full shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
