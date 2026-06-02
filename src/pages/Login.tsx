/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login, users } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both Email and Password.');
      return;
    }

    setIsLoading(true);

    // Simulate small latency
    setTimeout(() => {
      const success = login(email, password);
      setIsLoading(false);
      if (success) {
        navigate('/dashboard');
      } else {
        setErrorMsg('Invalid email or password. Feel free to use a demo badge below!');
      }
    }, 600);
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm bg-white dark:bg-[#1E293B] rounded-xl shadow-md border border-slate-200 dark:border-slate-805 overflow-hidden"
      >
        <div className="p-6 space-y-4">
          {/* Logo Heading */}
          <div className="flex flex-col items-center text-center space-y-1.5">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow shadow-blue-500/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              TaskFlow Workspace
            </h1>
            <p className="text-xs text-slate-500 max-w-[280px]">
              Modern team workspace for projects and active collaboration.
            </p>
          </div>

          {/* Validation Alert */}
          {(errorMsg) && (
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-lg text-red-750 dark:text-red-400 text-xs flex items-start gap-2 animate-none"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                Workspace Email Address
              </label>
              <div className="relative">
                <input
                  id="login-email-input"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition font-medium"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition font-medium"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Remember & Forgot Row */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 text-slate-500 select-none cursor-pointer text-[11px]">
                <input
                  id="login-remember-checkbox"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-850 text-[#2563EB] focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>Remember me</span>
              </label>
              <a
                id="login-forgot-pwd"
                href="#forgot"
                onClick={(e) => { e.preventDefault(); setErrorMsg("Click directly on any team member's card below to sign in instantly!"); }}
                className="font-bold text-[#2563EB] hover:text-blue-700 transition text-[11px]"
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-button"
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-3 bg-[#2563EB] hover:bg-blue-700 disabled:bg-blue-600/60 text-white font-bold rounded text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In To Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-wide text-center">
              Switch Workspace Team Members
            </h3>
            <div className="grid grid-cols-1 gap-1.5">
              {users.map((u) => (
                <button
                  id={`demo-user-${u.id}`}
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u.email)}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-805 hover:border-blue-400 dark:hover:border-[#2563EB] hover:bg-blue-50/10 transition text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold text-[10px]">
                      {u.avatar}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{u.name}</p>
                      <p className="text-[9px] text-slate-400 leading-none">{u.role}</p>
                    </div>
                  </div>
                  <UserCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2563EB] transition" />
                </button>
              ))}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
