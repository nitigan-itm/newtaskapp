/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  AlertCircle,
  Clock,
  Briefcase,
  User as UserIcon,
  Tag,
  ArrowUpDown,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus, TaskPriority } from '../types';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailModal from '../components/TaskDetailModal';

export default function Tasks() {
  const {
    tasks,
    projects,
    users,
    moveTask,
    deleteTask,
    theme
  } = useApp();

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search
  const [keyword, setKeyword] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('All');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'dueDate' | 'title' | 'priority'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Trigger brief alert banner
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Drag & drop logic
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('kanban-col-dragover');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('kanban-col-dragover');
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove('kanban-col-dragover');
    
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;

    const findTask = tasks.find(t => t.id === id);
    if (findTask) {
      if (findTask.status !== newStatus) {
        moveTask(id, newStatus);
        triggerToast(`Moved "${findTask.title}" directly to ${newStatus}`);
      }
    }
  };

  // Delete handler
  const handleDeleteTask = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete task "${title}"?`)) {
      deleteTask(id);
      triggerToast(`Deleted task "${title}"`);
    }
  };

  // Priority helpers
  const getPriorityWeight = (p: TaskPriority): number => {
    switch (p) {
      case 'High': return 3;
      case 'Medium': return 2;
      case 'Low': return 1;
      default: return 0;
    }
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'High':
        return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400';
      case 'Low':
        return 'bg-slate-100 text-slate-650 border-slate-200 dark:bg-slate-800 dark:text-slate-400';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-850';
    }
  };

  // Filter computation
  const filteredTasks = tasks.filter((t) => {
    // Keyword match
    const matchKeyword =
      t.title.toLowerCase().includes(keyword.toLowerCase()) ||
      t.description.toLowerCase().includes(keyword.toLowerCase());
    if (!matchKeyword) return false;

    // Project match
    if (selectedProject !== 'All' && t.projectId !== selectedProject) return false;

    // Assignee match
    if (selectedAssignee !== 'All' && t.assignee !== selectedAssignee) return false;

    // Priority match
    if (selectedPriority !== 'All' && t.priority !== selectedPriority) return false;

    // Status match
    if (selectedStatus !== 'All' && t.status !== selectedStatus) return false;

    return true;
  });

  // Sort computation
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comp = 0;
    if (sortBy === 'dueDate') {
      comp = a.dueDate.localeCompare(b.dueDate);
    } else if (sortBy === 'title') {
      comp = a.title.localeCompare(b.title);
    } else if (sortBy === 'priority') {
      comp = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
    }
    return sortOrder === 'asc' ? comp : -comp;
  });

  const columns: { label: TaskStatus; desc: string; color: string }[] = [
    { label: 'Backlog', desc: 'Future backlog items', color: 'border-slate-300 dark:border-slate-700' },
    { label: 'To Do', desc: 'Planned tasks', color: 'border-blue-300 dark:border-blue-900' },
    { label: 'In Progress', desc: 'Active execution', color: 'border-indigo-300 dark:border-indigo-900' },
    { label: 'Review', desc: 'Testing & QA review', color: 'border-violet-300 dark:border-violet-900' },
    { label: 'Done', desc: 'Finished milestones', color: 'border-emerald-300 dark:border-emerald-900' }
  ];

  return (
    <div className="space-y-4">
      {/* Toast Alert Panel */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-4 z-50 p-3 bg-[#2563EB] text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#2563EB]" />
            <span>Workspace Checklist Taskboard</span>
          </h1>
          <p className="text-xs text-slate-500">
            Track, drag, organize, and inspect all task items across absolute project boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode buttons */}
          <div className="flex p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg">
            <button
              id="view-mode-board"
              onClick={() => setViewMode('board')}
              className={`p-1.5 px-2.5 rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-white dark:bg-slate-800 text-[#2563EB] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Kanban Board View"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Board</span>
            </button>
            <button
              id="view-mode-list"
              onClick={() => setViewMode('list')}
              className={`p-1.5 px-2.5 rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-800 text-[#2563EB] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Unified List View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden md:inline">List</span>
            </button>
          </div>

          <button
            id="tasks-create-task-btn"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-1 px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded shadow-xs text-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Control row with Filters */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 p-3 rounded-xl space-y-3 shadow-xs">
        {/* Keyword Core Search */}
        <div className="relative">
          <input
            id="tasks-globalsearch"
            type="text"
            placeholder="Search tasks details, identifiers, names..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Modular dropdown filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1 text-xs">
          {/* Link Project select */}
          <div className="space-y-1">
            <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wide">Project Scope</span>
            <select
              id="tasks-filter-project"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-semibold text-slate-700 dark:text-slate-350"
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
              id="tasks-filter-assignee"
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-semibold text-slate-700 dark:text-slate-350"
            >
              <option value="All">All Assignees</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Priority filter */}
          <div className="space-y-1">
            <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wide">Priority Range</span>
            <select
              id="tasks-filter-priority"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-semibold text-slate-700 dark:text-slate-350"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="space-y-1">
            <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wide">Work Status</span>
            <select
              id="tasks-filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-semibold text-slate-700 dark:text-slate-350"
            >
              <option value="All">All Statuses</option>
              <option value="Backlog">Backlog</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {/* Sorting metrics */}
          <div className="space-y-1">
            <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wide">Ordering Sort</span>
            <div className="flex gap-1">
              <select
                id="tasks-sort-field"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[11px] font-semibold text-slate-700 dark:text-slate-355"
              >
                <option value="dueDate">Due Date</option>
                <option value="title">Alphabetical</option>
                <option value="priority">Priority weight</option>
              </select>
              <button
                id="tasks-sort-order-toggle"
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded font-black text-[10px] text-slate-600 dark:text-white cursor-pointer transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Area */}
      {viewMode === 'board' ? (
        /* KANBAN BOARD VIEW WITH DRAG & DROP */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 overflow-x-auto pb-4 items-start">
          {columns.map((col) => {
            const columnTasks = sortedTasks.filter(t => t.status === col.label);

            return (
              <div
                key={col.label}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.label)}
                className="bg-slate-50/70 dark:bg-[#0F172A]/40 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex flex-col space-y-2 min-h-[480px] transition-colors duration-150"
              >
                {/* Column header */}
                <div className="flex justify-between items-center border-b border-slate-205 dark:border-slate-850 pb-1.5 px-1 bg-transparent">
                  <div>
                    <h3 className="text-xs font-bold text-slate-705 dark:text-slate-300 uppercase tracking-wider">{col.label}</h3>
                    <span className="text-[9px] text-slate-400 capitalize">{col.desc}</span>
                  </div>
                  <span className="text-[9px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 w-5 h-5 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 shadow-xs">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Cards Inside Column */}
                <div className="space-y-2 overflow-y-auto max-h-[580px] pr-0.5">
                  {columnTasks.map((t) => {
                    const assignee = users.find(u => u.id === t.assignee);
                    const matchedProject = projects.find(p => p.id === t.projectId);

                    return (
                      <div
                        id={`task-board-item-${t.id}`}
                        key={t.id}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, t.id)}
                        onClick={() => setSelectedTaskId(t.id)}
                        className="bg-white dark:bg-[#1E293B] border border-slate-202 dark:border-slate-805 rounded-lg p-2.5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all space-y-1.5 group select-none"
                      >
                        {t.imageUrl && (
                          <div className="w-full h-24 rounded-md overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800/60 mb-1">
                            <img
                              src={t.imageUrl}
                              alt={t.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Task project scope & due date */}
                        <div className="flex justify-between gap-2 items-center">
                          <span className="text-[8px] font-black uppercase text-[#2563EB] truncate max-w-[90px]" title={matchedProject?.name}>
                            {matchedProject?.name || 'Workspace'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap bg-transparent">
                            {t.dueDate.substring(5)}
                          </span>
                        </div>

                        {/* Title & Trash button */}
                        <div className="flex justify-between items-start gap-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[#2563EB] transition-colors" title={t.title}>
                            {t.title}
                          </p>
                          <button
                            id={`delete-btn-${t.id}`}
                            onClick={(e) => handleDeleteTask(e, t.id, t.title)}
                            className="text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete task item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Description snippet */}
                        {t.description && (
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                            {t.description}
                          </p>
                        )}

                        {t.percentage !== undefined && t.percentage > 0 && (
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                              <span>Progress</span>
                              <span>{t.percentage}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800/40 h-1 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${t.percentage}%` }}
                                className="bg-[#2563EB] h-full rounded-full transition-all"
                              />
                            </div>
                          </div>
                        )}

                        {/* Quick state row */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800/40 mt-1">
                          {/* Priority badge */}
                          <span className={`px-1 rounded text-[8px] font-extrabold uppercase tracking-wide border border-transparent ${getPriorityColor(t.priority)}`}>
                            {t.priority}
                          </span>

                          {/* Member info block */}
                          {assignee && (
                            <div className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-blue-50 dark:bg-indigo-950 text-[8px] border border-white dark:border-slate-800 text-[#2563EB] dark:text-blue-350 font-bold flex items-center justify-center">
                                {assignee.avatar}
                              </span>
                              <span className="text-[9px] text-slate-400 truncate max-w-[60px]">{assignee.name.split(' ')[0]}</span>
                            </div>
                          )}
                        </div>

                        {/* Direct dropdown to change column on click exclusion */}
                        <div className="pt-1.5 flex justify-end">
                          <select
                            id={`tasks-quickchange-${t.id}`}
                            value={t.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              moveTask(t.id, e.target.value as TaskStatus);
                              triggerToast(`Moved "${t.title}" to ${e.target.value}`);
                            }}
                            className="text-[9px] font-bold py-0.5 px-1 rounded-sm bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:text-[#2563EB] dark:hover:text-[#2563EB] focus:outline-none transition-colors cursor-pointer"
                          >
                            <option value="Backlog">Backlog</option>
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Review">Review</option>
                            <option value="Done">Done</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}

                  {columnTasks.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-[9px] uppercase font-bold tracking-wider border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/20">
                      Empty column
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* COMPREHENSIVE TABULAR TABLE VIEW */
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Task Title</th>
                  <th className="py-2.5 px-4">Project Scope</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Priority</th>
                  <th className="py-2.5 px-4">Assignee</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {sortedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No workspace tasks match your selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  sortedTasks.map((t) => {
                    const assignee = users.find(u => u.id === t.assignee);
                    const matchedProject = projects.find(p => p.id === t.projectId);

                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTaskId(t.id)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/10 cursor-pointer transition select-none"
                      >
                        <td className="py-2 px-4 font-bold text-slate-900 dark:text-white max-w-[220px] truncate" title={t.title}>
                          {t.title}
                        </td>
                        <td className="py-2 px-4 font-medium text-slate-500 dark:text-slate-400 max-w-[140px] truncate">
                          {matchedProject?.name || 'Workspace'}
                        </td>
                        <td className="py-2 px-4">
                          <select
                            id={`tasks-list-quickchange-${t.id}`}
                            value={t.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              moveTask(t.id, e.target.value as TaskStatus);
                              triggerToast(`Updated status of "${t.title}" to ${e.target.value}`);
                            }}
                            className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded cursor-pointer border border-transparent focus:outline-none transition ${
                              t.status === 'Done' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                              t.status === 'Review' ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400' :
                              t.status === 'In Progress' ? 'bg-blue-50 text-blue-750 dark:bg-blue-950/20 dark:text-blue-400' :
                              'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            <option value="Backlog">Backlog</option>
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Review">Review</option>
                            <option value="Done">Done</option>
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-0.5 text-[8px] font-extrabold rounded uppercase tracking-wide ${getPriorityColor(t.priority)}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          {assignee ? (
                            <div className="flex items-center gap-1.5 animate-none">
                              <span className="w-4.5 h-4.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold text-[8px]">
                                {assignee.avatar}
                              </span>
                              <span className="font-medium text-xs text-slate-700 dark:text-slate-300">{assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-2 px-4 font-mono text-[10px] text-slate-405">
                          {t.dueDate}
                        </td>
                        <td className="py-2 px-4 bg-transparent">
                          <button
                            id={`tasks-list-delete-${t.id}`}
                            onClick={(e) => handleDeleteTask(e, t.id, t.title)}
                            className="p-1 rounded text-slate-405 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                            title="Delete task item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Creation Modal Popup */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Task inspect & update modal */}
      <TaskDetailModal
        isOpen={selectedTaskId !== null}
        onClose={() => setSelectedTaskId(null)}
        taskId={selectedTaskId}
      />
    </div>
  );
}
