/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Search as SearchIcon,
  SlidersHorizontal,
  Calendar,
  Briefcase,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, TaskPriority, TaskStatus } from '../types';
import TaskDetailModal from '../components/TaskDetailModal';

export default function Search() {
  const { tasks, projects, users } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [keyword, setKeyword] = useState('');
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedAssignee, setSelectedAssignee] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortBy, setSortBy] = useState<'dueDate' | 'title'>('dueDate');

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Sync state if task is clicked/referenced in parameters
  useEffect(() => {
    const qTask = searchParams.get('task');
    if (qTask) {
      setActiveTaskId(qTask);
    }
  }, [searchParams]);

  // Combined Filtering Logic
  const results = tasks.filter(t => {
    const matchesKeyword = t.title.toLowerCase().includes(keyword.toLowerCase()) ||
                           t.description.toLowerCase().includes(keyword.toLowerCase());
    
    if (!matchesKeyword) return false;

    if (selectedProject !== 'All' && t.projectId !== selectedProject) return false;
    if (selectedAssignee !== 'All' && t.assignee !== selectedAssignee) return false;
    if (selectedStatus !== 'All' && t.status !== selectedStatus) return false;
    if (selectedPriority !== 'All' && t.priority !== selectedPriority) return false;

    return true;
  });

  // Sort
  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    } else {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
  });

  const handleSelectTask = (tid: string) => {
    setActiveTaskId(tid);
    setSearchParams({ task: tid });
  };

  const handleCloseModal = () => {
    setActiveTaskId(null);
    setSearchParams({});
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'High': return 'bg-red-50 text-red-750 dark:bg-red-950/25 dark:text-red-400';
      case 'Medium': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400';
      default: return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-350';
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Header section */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <SearchIcon className="w-5 h-5 text-[#2563EB]" />
          <span>Universal Workspace Search</span>
        </h1>
        <p className="text-xs text-slate-500">
          Query checklists, tickets, and cross-project tasks in seconds.
        </p>
      </div>

      {/* Main Terminal Box */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 p-3 rounded-xl space-y-3 shadow-xs">
        
        {/* Keyword core bar */}
        <div className="relative">
          <input
            id="global-search-query-input"
            type="text"
            placeholder="Search tasks by details, codes, or task keys..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition font-medium"
          />
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Advanced metadata filters grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1 text-xs">
          
          {/* Project select */}
          <div className="space-y-1">
            <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wide">Project</span>
            <select
              id="search-filter-project"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-2 py-1 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Assignee select */}
          <div className="space-y-1">
            <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wide">Assignee</span>
            <select
              id="search-filter-assignee"
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="w-full px-2 py-1 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Assignees</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Status select */}
          <div className="space-y-1">
            <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wide">Status</span>
            <select
              id="search-filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2 py-1 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Statuses</option>
              <option value="Backlog">Backlog</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {/* Priority select */}
          <div className="space-y-1">
            <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wide">Priority</span>
            <select
              id="search-filter-priority"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-2 py-1 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Sorting metrics */}
          <div className="space-y-1">
            <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wide">Order By</span>
            <select
              id="search-sort-metric"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2 py-1 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="dueDate">Due Date Limit</option>
              <option value="title">Alphabetical Title</option>
            </select>
          </div>

        </div>

      </div>

      {/* Results grid list layout */}
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Results Found ({sortedResults.length})
          </h2>
          {keyword && (
            <span className="text-[9px] text-[#2563EB] font-bold select-all bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
              Filtered lookup term: "{keyword}"
            </span>
          )}
        </div>

        {sortedResults.length === 0 ? (
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 p-12 rounded-xl text-center shadow-xs">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-slate-700">No tasks found.</h3>
            <p className="text-xs text-slate-405 mt-1">Try adjusting keywords or relaxing filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedResults.map((t) => {
              const matchedProject = projects.find(p => p.id === t.projectId);
              const matchedAssignee = users.find(u => u.id === t.assignee);

              return (
                <div
                  id={`search-match-${t.id}`}
                  key={t.id}
                  onClick={() => handleSelectTask(t.id)}
                  className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 p-3.5 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between h-36 shadow-sm select-text"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex justify-between gap-3 items-baseline">
                      <span className="text-[9px] font-bold uppercase tracking-wide text-[#2563EB] truncate max-w-[150px]">
                        {matchedProject?.name || 'Workspace'}
                      </span>
                      <span className="text-[10px] text-slate-405 font-medium">{t.dueDate}</span>
                    </div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate" title={t.title}>{t.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1 leading-normal">{t.description || 'No description provided.'}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-2 bg-transparent">
                    <div className="flex items-center gap-1">
                      {matchedAssignee && (
                        <>
                          <span className="w-4 h-4 rounded-full bg-blue-50 dark:bg-blue-900/40 text-[#2563EB] text-[8px] font-bold flex items-center justify-center">
                            {matchedAssignee.avatar}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{matchedAssignee.name}</span>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 text-[8px] font-extrabold rounded uppercase tracking-wide border border-transparent ${getPriorityColor(t.priority)}`}>
                        {t.priority}
                      </span>
                      <span className={`px-2 py-0.5 text-[8px] font-extrabold rounded uppercase tracking-wide text-white ${
                        t.status === 'Done' ? 'bg-emerald-500' :
                        t.status === 'Review' ? 'bg-[#2563EB]' :
                        t.status === 'In Progress' ? 'bg-blue-600' : 'bg-slate-400'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Task detail modal drawer */}
      <TaskDetailModal
        isOpen={activeTaskId !== null}
        onClose={handleCloseModal}
        taskId={activeTaskId}
      />
    </div>
  );
}
