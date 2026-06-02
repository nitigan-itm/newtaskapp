/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Calendar, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { users, addProject } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(['u1']); // default has creator
  const [dueDate, setDueDate] = useState('');
  const [errorAndValidation, setErrorAndValidation] = useState('');

  const toggleMember = (userId: string) => {
    if (selectedMembers.includes(userId)) {
      if (selectedMembers.length > 1) { // keep at least one member
        setSelectedMembers(selectedMembers.filter(id => id !== userId));
      }
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorAndValidation('');

    if (!name.trim()) {
      setErrorAndValidation('Project Name is required.');
      return;
    }

    if (description.length > 500) {
      setErrorAndValidation('Description cannot exceed 500 characters.');
      return;
    }

    if (!dueDate) {
      setErrorAndValidation('Please pick a target due date.');
      return;
    }

    // Call Context to create project
    addProject(name.trim(), description.trim(), selectedMembers, dueDate);
    
    // Reset and Close
    setName('');
    setDescription('');
    setSelectedMembers(['u1']);
    setDueDate('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog Panel */}
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Project</h2>
              <button
                id="close-create-project-modal"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {errorAndValidation && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950/30 rounded-xl text-red-650 dark:text-red-400 text-sm flex items-start gap-2 animate-pulse">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorAndValidation}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Project Name *
                </label>
                <input
                  id="project-name-input"
                  type="text"
                  placeholder="e.g. Website Redesign"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  id="project-description-input"
                  placeholder="Briefly summarize what this project covers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                  <span>Describe the scope metrics.</span>
                  <span>{description.length}/500 chars</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Due Date *
                  </label>
                  <div className="relative">
                    <input
                      id="project-duedate-input"
                      type="date"
                      value={dueDate}
                      min={new Date().toISOString().split('T')[0]} // prevent dates prior to today
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Workspace Project Members
                  </label>
                  <div className="flex flex-wrap gap-1.5 py-1">
                    {users.map(u => {
                      const isSelected = selectedMembers.includes(u.id);
                      return (
                        <button
                          id={`toggle-member-${u.id}`}
                          type="button"
                          key={u.id}
                          onClick={() => toggleMember(u.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-200 dark:border-blue-950'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center font-bold text-[9px] text-blue-600 dark:text-blue-400">
                            {u.avatar}
                          </span>
                          <span>{u.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 justify-end">
                <button
                  id="cancel-create-project"
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 text-sm font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="submit-create-project"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/15 hover:shadow-lg transition cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
