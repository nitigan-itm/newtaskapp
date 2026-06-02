/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Settings as SettingsIcon,
  User as UserIcon,
  Moon,
  Sun,
  Palette,
  Bell,
  CheckCircle,
  Briefcase,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const {
    currentUser,
    theme,
    setTheme,
    notificationsEnabled,
    setNotificationsEnabled,
    updateUserAvatar
  } = useApp();

  const [avatarInit, setAvatarInit] = useState(currentUser?.avatar || 'SJ');
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarInit.trim()) return;
    
    updateUserAvatar(avatarInit.trim().substring(0, 2));
    triggerSuccess('Workspace profile settings saved successfully.');
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  const themeList = [
    { id: 'light', name: 'Standard Light', desc: 'Clean, soft-white canvas', icon: Sun, colors: 'bg-white border-slate-200 text-slate-900' },
    { id: 'dark', name: 'Slate Dark', desc: 'Eye-friendly twilight charcoal', icon: Moon, colors: 'bg-[#0F172A] border-slate-800 text-slate-100 dark:bg-slate-900' },
    { id: 'warm', name: 'Warm Amber', desc: 'Muted editorial sepia sand', icon: Palette, colors: 'bg-[#FAF6F0] border-[#EBE3D5] text-amber-955' },
  ] as const;

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-[#2563EB]" />
          <span>Workspace Preferences</span>
        </h1>
        <p className="text-xs text-slate-500">
          Customize active themes, member credentials, and notification triggers.
        </p>
      </div>

      {/* Success banner */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-lg text-emerald-800 dark:text-emerald-400 text-xs flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-bold">{successMsg}</span>
        </motion.div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column Profile Setting */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Profile settings */}
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 p-4 rounded-xl space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-slate-905 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-850">
              <UserIcon className="w-4.5 h-4.5 text-[#2563EB]" />
              <span>Workspace Profile details</span>
            </h2>

            {currentUser ? (
              <form onSubmit={handleUpdateProfile} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.name}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-450 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Email Coordinates</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.email}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-450 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Role / Designation</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.role}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-450 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Avatar Initials (2 Chars)</label>
                    <input
                      id="profile-avatar-input"
                      type="text"
                      maxLength={2}
                      value={avatarInit}
                      onChange={(e) => setAvatarInit(e.target.value.toUpperCase())}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    id="save-profile-btn"
                    type="submit"
                    className="px-4 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs pointer-events-auto cursor-pointer transition-colors"
                  >
                    Save Avatar Initials
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-slate-400 italic">Please sign in to configure profile metadata.</p>
            )}
          </div>

          {/* Theme visual settings cards */}
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 p-4 rounded-xl space-y-3 shadow-sm">
            <h2 className="text-sm font-bold text-slate-905 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-850">
              <Sparkles className="w-4.5 h-4.5 text-amber-500" />
              <span>Theme Layout Appearance</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {themeList.map((item) => {
                const isSelected = theme === item.id;
                const Icon = item.icon;
                return (
                  <button
                    id={`theme-btn-${item.id}`}
                    key={item.id}
                    onClick={() => {
                      setTheme(item.id);
                      triggerSuccess(`Applied ${item.name} theme.`);
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between h-28 transition cursor-pointer select-none ${
                      isSelected
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50/10 dark:bg-slate-800 ring-1 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className="p-1 px-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-355">
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 bg-[#2563EB] rounded-full" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">{item.name}</span>
                      <span className="text-[9px] text-slate-400 block truncate">{item.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Settings sidebar Column Workspace Notifications preferences */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 p-4 rounded-xl space-y-4 h-fit shadow-sm">
          <h2 className="text-sm font-bold text-slate-905 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-850">
            <Bell className="w-4.5 h-4.5 text-[#2563EB]" />
            <span>Workspace Notifications</span>
          </h2>

          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5 max-w-[180px]">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Workspace Alerts</span>
                <span className="text-[10px] text-slate-400 block leading-tight">Post notification banners on drag actions or logs</span>
              </div>
              
              <button
                id="toggle-notifications-btn"
                onClick={() => {
                  setNotificationsEnabled(!notificationsEnabled);
                  triggerSuccess(`Notifications ${!notificationsEnabled ? 'enabled' : 'disabled'} successfully.`);
                }}
                className={`relative inline-flex h-5 w-10 mt-1 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notificationsEnabled ? 'bg-[#2563EB]' : 'bg-slate-200 dark:bg-slate-805'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 text-slate-500 text-[10px] leading-normal flex items-start gap-1.5 select-text">
              <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>Updating preferences applies immediately. All task completions, moves, and comments follow these notification guidelines locally.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
