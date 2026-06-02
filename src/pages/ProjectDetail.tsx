/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trello,
  List,
  Plus,
  ArrowLeft,
  Calendar,
  User as UserIcon,
  Tag,
  MessageSquare,
  Sparkles,
  Search,
  SlidersHorizontal,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TaskStatus, TaskPriority, Task } from '../types';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailModal from '../components/TaskDetailModal';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { projects, tasks, users, moveTask, theme } = useApp();

  const [activeTab, setActiveTab] = useState<'board' | 'list'>('board');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // List view filters state
  const [priorityFilter, setPriorityFilter] = useState<'All' | TaskPriority>('All');
  const [assigneeFilter, setAssigneeFilter] = useState<'All' | string>('All');
  const [sortField, setSortField] = useState<'dueDate' | 'priority'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Success movement feedback toast indicators
  const [toastMessage, setToastMessage] = useState('');

  // Find active project
  const project = projects.find(p => p.id === id);

  // Deep-linking handle: check URL queries on startup
  useEffect(() => {
    const queryTaskId = searchParams.get('task');
    if (queryTaskId) {
      // Validate that task actually belongs to this project
      const match = tasks.find(t => t.id === queryTaskId && t.projectId === id);
      if (match) {
        setSelectedTaskId(queryTaskId);
      }
    }
  }, [searchParams, tasks, id]);

  if (!project) {
    return (
      <div className="text-center py-16 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-550 mx-auto" />
        <h2 className="text-lg font-bold">Project Not Found</h2>
        <p className="text-slate-500 text-sm">We couldn't retrieve this project folder.</p>
        <button
          onClick={() => navigate('/projects')}
          className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const projectTasks = tasks.filter(t => t.projectId === project.id);

  // Stats
  const columns: { label: TaskStatus; desc: string }[] = [
    { label: 'Backlog', desc: 'Future features' },
    { label: 'To Do', desc: 'Planned tasks' },
    { label: 'In Progress', desc: 'Active execution' },
    { label: 'Review', desc: 'Testing & QA' },
    { label: 'Done', desc: 'Finished milestones' },
  ];

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'High': return 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-950/30';
      case 'Medium': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-955/30';
      default: return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-indigo-300 border border-slate-200 dark:border-slate-700/60';
    }
  };

  // Drag handles
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
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
    
    const taskIdString = e.dataTransfer.getData('text/plain');
    if (!taskIdString) return;

    const findTask = tasks.find(t => t.id === taskIdString);
    if (findTask) {
      const oldStatus = findTask.status;
      if (oldStatus !== newStatus) {
        moveTask(taskIdString, newStatus);
        triggerToast(`Moved "${findTask.title}" directly to ${newStatus}`);
      }
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Click task selector (handles search params cleanly)
  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setSearchParams({ task: taskId });
  };

  const handleCloseTaskModal = () => {
    setSelectedTaskId(null);
    setSearchParams({});
  };

  // Filter & Sort tasks for List View
  const listFilteredTasks = projectTasks.filter(t => {
    const priorityMatch = priorityFilter === 'All' || t.priority === priorityFilter;
    const assigneeMatch = assigneeFilter === 'All' || t.assignee === assigneeFilter;
    return priorityMatch && assigneeMatch;
  });

  const getPriorityWeight = (p: TaskPriority) => {
    switch(p) { case 'High': return 3; case 'Medium': return 2; default: return 1; }
  };

  const listSortedTasks = [...listFilteredTasks].sort((a, b) => {
    let comp = 0;
    if (sortField === 'dueDate') {
      comp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else {
      comp = getPriorityWeight(a.priority) - getPriorityWeight(b.priority);
    }
    return sortOrder === 'asc' ? comp : -comp;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-slate-800"
          >
            <ThumbsUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Breadcrumb & Project stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        <div className="space-y-1">
          <button
            id="back-to-projects-btn"
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Workspace Folders</span>
          </button>
          
          <div className="flex items-baseline gap-3 pt-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{project.name}</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              {project.progress}% Done
            </span>
          </div>

          <p className="text-xs text-slate-500 select-text max-w-2xl">{project.description}</p>
        </div>

        {/* Action controllers */}
        <div className="flex items-center gap-2.5 self-end md:self-auto flex-shrink-0">
          
          {/* View Toggles */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-150 dark:border-slate-850">
            <button
              id="view-toggle-board"
              onClick={() => setActiveTab('board')}
              className={`p-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition ${
                activeTab === 'board'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Trello className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban Board</span>
            </button>
            <button
              id="view-toggle-list"
              onClick={() => setActiveTab('list')}
              className={`p-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition ${
                activeTab === 'list'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Task List</span>
            </button>
          </div>

          <button
            id="trigger-add-task-modal"
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-500/15 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Progress visualizer */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-1/3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-650 flex items-center justify-center font-bold text-xs flex-shrink-0">
            {projectTasks.length}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Active Task Backings</p>
            <p className="text-[10px] text-slate-400">Total milestones under project tracking</p>
          </div>
        </div>

        <div className="w-full sm:w-2/3 space-y-1.5">
          <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-wide">
            <span className="text-slate-450">Fulfillment Gauge</span>
            <span className="text-blue-600 dark:text-blue-400">{project.progress}% Complete</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Conditional Rendering Tab: Board or List */}
      {projectTasks.length === 0 ? (
        <div className="bg-white dark:bg-[#1E293B] py-16 text-center border border-dashed border-slate-205 dark:border-slate-800 rounded-3xl">
          <Sparkles className="w-12 h-12 text-slate-350 mx-auto mb-3 animate-none" />
          <h2 className="text-sm font-bold text-slate-700">No active tasks in this project yet</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Click 'New Task' to construct a task card and assign responsibility.</p>
        </div>
      ) : activeTab === 'board' ? (
        
        /* 1. KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 overflow-x-auto pb-4 items-start">
          {columns.map((col) => {
            const statusTasks = projectTasks.filter(t => t.status === col.label);

            return (
              <div
                id={`kanban-col-${col.label.toLowerCase().replace(/\s+/g, '-')}`}
                key={col.label}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.label)}
                className="bg-slate-50 dark:bg-[#0F172A]/40 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col space-y-2.5 min-h-[480px] transition-colors duration-150"
              >
                {/* Column header */}
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-850 pb-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{col.label}</h3>
                    <span className="text-[9px] text-slate-405 capitalize">{col.desc}</span>
                  </div>
                  <span className="text-[9px] font-bold bg-white dark:bg-slate-80 w-5 h-5 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 shadow-xs leading-none text-slate-600 dark:text-slate-400">
                    {statusTasks.length}
                  </span>
                </div>

                {/* Vertical Scroll for cards inside column */}
                <div className="space-y-2 overflow-y-auto max-h-[600px] pr-0.5">
                  {statusTasks.map((t) => {
                    const assignee = users.find(u => u.id === t.assignee);
                    const isUrgent = t.priority === 'High';

                    return (
                      <div
                        id={`kanban-card-${t.id}`}
                        key={t.id}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, t.id)}
                        onClick={() => handleSelectTask(t.id)}
                        className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 rounded-lg p-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all space-y-2 group"
                      >
                        {t.imageUrl && (
                          <div className="w-full h-24 rounded-md overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800/60">
                            <img
                              src={t.imageUrl}
                              alt={t.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex justify-between items-start gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-normal line-clamp-2 select-text group-hover:text-[#2563EB] transition-colors" title={t.title}>
                            {t.title}
                          </p>
                        </div>

                        {t.description && (
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-normal">
                            {t.description}
                          </p>
                        )}

                        {t.percentage !== undefined && t.percentage > 0 && (
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-[9px] text-slate-405 font-bold">
                              <span>Progress</span>
                              <span>{t.percentage}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800/40 h-1.5 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${t.percentage}%` }}
                                className="bg-[#2563EB] h-full rounded-full transition-all"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800/40">
                          <div className="flex items-center gap-1 text-[9px] text-slate-405">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>{t.dueDate.substring(5)}</span>
                          </div>

                          <span className={`px-1.5 py-0.5 text-[8px] rounded font-extrabold uppercase tracking-wide border border-transparent ${getPriorityColor(t.priority)}`}>
                            {t.priority}
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-transparent mt-1 border-t border-slate-100 dark:border-slate-800/10 pt-1.5">
                          {assignee ? (
                            <div className="flex items-center gap-1">
                              <span className="w-4 h-4 rounded-full bg-blue-50 dark:bg-indigo-950 text-[8px] border border-white dark:border-slate-800 text-[#2563EB] dark:text-blue-350 font-bold flex items-center justify-center">
                                {assignee.avatar}
                              </span>
                              <span className="text-[9px] text-slate-405">{assignee.name.split(' ')[0]}</span>
                            </div>
                          ) : (
                            <div className="inline-block" />
                          )}

                          <select
                            id={`card-quick-status-${t.id}`}
                            value={t.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              moveTask(t.id, e.target.value as TaskStatus);
                              triggerToast(`Moved "${t.title}" to ${e.target.value}`);
                            }}
                            className="text-[9px] font-bold py-0.5 px-1 rounded-sm bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-605 dark:text-slate-300 hover:text-[#2563EB] dark:hover:text-[#2563EB] focus:outline-none transition-colors cursor-pointer"
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

                  {statusTasks.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-[10px] uppercase font-bold tracking-wider border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/20">
                      Empty column
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        
        /* 2. TABULAR TASK LIST VIEW */
        <div className="space-y-4">
          
          {/* Filtering control row */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 p-3 rounded-xl shadow-xs">
            <div className="flex flex-wrap gap-3 items-center">
              
              {/* Filter Priority */}
              <div className="flex items-center gap-1.5 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-450 font-bold uppercase tracking-wide text-[10px]">Priority:</span>
                <select
                  id="list-filter-priority"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-semibold"
                >
                  <option value="All">All Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Filter Assignee */}
              <div className="flex items-center gap-1.5 text-xs">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-450 font-bold uppercase tracking-wide text-[10px]">Assignee:</span>
                <select
                  id="list-filter-assignee"
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-semibold"
                >
                  <option value="All">All Assignees</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Sorting controls */}
            <div className="flex items-center gap-1.5 text-xs self-end sm:self-auto">
              <span className="text-slate-450 font-bold uppercase tracking-wide text-[10px]">Sort:</span>
              <select
                id="list-sort-field"
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="px-2 py-1 bg-slate-50 dark:bg-slate-905 border border-slate-200 dark:border-slate-800 rounded text-xs font-semibold"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority Weight</option>
              </select>
              <button
                id="list-sort-order-toggle"
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-805 rounded text-[10px] font-black tracking-wider uppercase cursor-pointer transition-colors"
              >
                {sortOrder}
              </button>
            </div>
          </div>

          {/* Table list */}
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Task Name</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Priority</th>
                    <th className="py-2.5 px-4">Assignee</th>
                    <th className="py-2.5 px-2">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {listSortedTasks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">No tasks match selected filter criteria.</td>
                    </tr>
                  ) : (
                    listSortedTasks.map(t => {
                      const assigneeUser = users.find(u => u.id === t.assignee);
                      return (
                        <tr
                          id={`list-task-row-${t.id}`}
                          key={t.id}
                          onClick={() => handleSelectTask(t.id)}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/10 cursor-pointer transition select-text"
                        >
                          <td className="py-2 px-4 font-bold text-slate-900 dark:text-white max-w-[280px] truncate">{t.title}</td>
                          <td className="py-2 px-4">
                            <select
                              id={`list-quick-status-${t.id}`}
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
                            <div className="flex items-center gap-1.5 animate-none">
                              {assigneeUser && (
                                <>
                                  <span className="w-4.5 h-4.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold text-[8px]">
                                    {assigneeUser.avatar || 'U'}
                                  </span>
                                  <span className="font-medium text-xs text-slate-700 dark:text-slate-350">{assigneeUser.name}</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-slate-450">{t.dueDate}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Trigger Modals */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        preselectedProjectId={project.id}
      />

      <TaskDetailModal
        isOpen={selectedTaskId !== null}
        onClose={handleCloseTaskModal}
        taskId={selectedTaskId}
      />
    </div>
  );
}
