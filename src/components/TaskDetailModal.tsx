/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar,
  User as UserIcon,
  Tag,
  MessageSquare,
  Trash2,
  CheckCircle2,
  Clock,
  Briefcase,
  Paperclip,
  Check,
  Edit2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TaskStatus, TaskPriority, Task, Comment } from '../types';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
}

export default function TaskDetailModal({ isOpen, onClose, taskId }: TaskDetailModalProps) {
  const {
    tasks,
    users,
    projects,
    comments,
    currentUser,
    updateTask,
    deleteTask,
    addComment,
    theme,
    addUser
  } = useApp();

  const [task, setTask] = useState<Task | null>(null);
  const [isEditingTexts, setIsEditingTexts] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDesc, setEditedDesc] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [commentError, setCommentError] = useState('');

  // States for adding person
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonRole, setNewPersonRole] = useState('');
  const [isAddingNewUser, setIsAddingNewUser] = useState(false);
  const [addUserError, setAddUserError] = useState('');

  // Synchronize task local state whenever taskId or tasks list changes
  useEffect(() => {
    if (taskId) {
      const found = tasks.find(t => t.id === taskId);
      if (found) {
        setTask(found);
        setEditedTitle(found.title);
        setEditedDesc(found.description);
      } else {
        setTask(null);
      }
    }
    setIsEditingTexts(false);
  }, [taskId, tasks]);

  if (!task) return null;

  const currentProject = projects.find(p => p.id === task.projectId);
  const taskAssignee = users.find(u => u.id === task.assignee);
  const taskComments = comments.filter(c => c.taskId === task.id)
    .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const handleStatusChange = (newStatus: TaskStatus) => {
    const updated = { ...task, status: newStatus };
    updateTask(updated);
  };

  const handlePriorityChange = (newPriority: TaskPriority) => {
    const updated = { ...task, priority: newPriority };
    updateTask(updated);
  };

  const handleAssigneeChange = (newAssigneeId: string) => {
    const updated = { ...task, assignee: newAssigneeId };
    updateTask(updated);
  };

  const handleDueDateChange = (newDate: string) => {
    const updated = { ...task, dueDate: newDate };
    updateTask(updated);
  };

  const handlePercentageChange = (newPercentage: number) => {
    const updated = { ...task, percentage: newPercentage };
    updateTask(updated);
  };

  const handlePresetImage = (url: string) => {
    const updated = { ...task, imageUrl: url };
    updateTask(updated);
  };

  const handlePercentageImageChange = (base64Str: string) => {
    const updated = { ...task, imageUrl: base64Str };
    updateTask(updated);
  };

  const handleRemoveImage = () => {
    const updated = { ...task, imageUrl: undefined };
    updateTask(updated);
  };

  const handleCreateAndAssignUser = (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError('');
    if (!newPersonName.trim()) {
      setAddUserError('Name is required.');
      return;
    }
    const newlyCreated = addUser(newPersonName.trim(), newPersonRole.trim() || 'Contributor');
    const updated = { ...task, assignee: newlyCreated.id };
    updateTask(updated);
    setNewPersonName('');
    setNewPersonRole('');
    setIsAddingNewUser(false);
  };

  const handleSaveTextEdits = () => {
    if (!editedTitle.trim()) return;
    const updated = { ...task, title: editedTitle.trim(), description: editedDesc.trim() };
    updateTask(updated);
    setIsEditingTexts(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
      onClose();
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');

    if (!commentInput.trim()) {
      setCommentError('Comment cannot be empty.');
      return;
    }

    if (commentInput.length > 1000) {
      setCommentError('Comment cannot exceed 1000 characters.');
      return;
    }

    addComment(task.id, commentInput.trim());
    setCommentInput('');
  };

  // Render colorful initial avatars
  const renderUserAvatar = (userId: string, sizeClass = "w-8 h-8 text-[11px]") => {
    const matchUser = users.find(u => u.id === userId);
    if (!matchUser) return <div className={`${sizeClass} rounded-full bg-slate-200`} />;

    const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-violet-600'];
    const charCodeSum = matchUser.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorClass = colors[charCodeSum % colors.length];
    const initials = matchUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2);

    return (
      <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white ${colorClass}`} title={matchUser.name}>
        {initials}
      </div>
    );
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'High': return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-950/40';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-950/40';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700';
    }
  };

  const getStatusColor = (s: TaskStatus) => {
    switch (s) {
      case 'Done': return 'bg-emerald-500 text-white';
      case 'Review': return 'bg-purple-600 text-white';
      case 'In Progress': return 'bg-blue-600 text-white';
      case 'To Do': return 'bg-slate-500 text-white';
      default: return 'bg-slate-300 text-slate-700';
    }
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

          {/* Dialog Frame */}
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-4xl h-[90vh] sm:h-[85vh] bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden z-10"
          >
            {/* Top Bar Navigation */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span>{currentProject?.name || 'Workspace'}</span>
                <span>/</span>
                <span className="text-blue-600 dark:text-blue-400">Task Details</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="task-detail-delete"
                  onClick={handleDelete}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                  title="Delete Task"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  id="task-detail-close"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Content Splitted split layout */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Column: Title, Description, Comment Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
                {isEditingTexts ? (
                  <div className="space-y-3">
                    <input
                      id="edit-task-title-input"
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-full text-xl font-bold px-3 py-2 border border-slate-250 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      id="edit-task-description-input"
                      value={editedDesc}
                      onChange={(e) => setEditedDesc(e.target.value)}
                      rows={4}
                      className="w-full text-sm px-3 py-2 border border-slate-250 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setIsEditingTexts(false)}
                        className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-350 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        id="save-text-edits"
                        onClick={handleSaveTextEdits}
                        className="flex items-center gap-1 px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-4 group">
                      <h1 className="text-xl font-bold text-slate-900 dark:text-white select-text">
                        {task.title}
                      </h1>
                      <button
                        id="toggle-task-text-edit"
                        onClick={() => setIsEditingTexts(true)}
                        className="p-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-300 hover:bg-blue-50/20 text-slate-400 hover:text-blue-600 text-xs flex items-center gap-1 cursor-pointer transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </div>
                    <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 text-slate-650 dark:text-slate-300 text-sm whitespace-pre-wrap select-text">
                      {task.description || (
                        <span className="text-slate-400 italic font-normal">No description provided. Click 'Edit' to add layout requirements.</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Comment Section Header */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <MessageSquare className="w-5 h-5 text-slate-500" />
                    <span>Discussion ({taskComments.length})</span>
                  </div>

                  {/* Comment List */}
                  <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                    {taskComments.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-slate-150 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                        No comments yet. Start the discussion below.
                      </div>
                    ) : (
                      taskComments.map((com) => {
                        const author = users.find(u => u.id === com.authorId);
                        const comTime = new Date(com.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });

                        return (
                          <div key={com.id} className="flex gap-3 text-sm items-start">
                            {renderUserAvatar(com.authorId, "w-8 h-8 text-[11px] rounded-full flex-shrink-0")}
                            <div className="flex-1 bg-slate-50 dark:bg-slate-905 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                              <div className="flex justify-between items-baseline mb-1">
                                <span className="font-semibold text-slate-800 dark:text-slate-250 text-xs">{author?.name || 'Unknown Team'}</span>
                                <span className="text-[10px] text-slate-400">{comTime}</span>
                              </div>
                              <p className="text-slate-650 dark:text-slate-300 leading-relaxed break-words">{com.message}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Comment Input */}
                  <form onSubmit={handlePostComment} className="pt-2">
                    {commentError && (
                      <p className="text-red-505 dark:text-red-400 text-xs mb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{commentError}</span>
                      </p>
                    )}
                    <div className="flex items-start gap-3">
                      {currentUser && renderUserAvatar(currentUser.id, "w-8 h-8 text-[11px] rounded-full flex-shrink-0")}
                      <div className="flex-1 relative">
                        <input
                          id="comment-text-input"
                          type="text"
                          placeholder="Ask a question or comment..."
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          maxLength={1000}
                          className="w-full px-4 pr-16 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                        />
                        <button
                          id="submit-comment-btn"
                          type="submit"
                          className="absolute right-2 top-1.5 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition cursor-pointer"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between mt-1 text-[9px] text-slate-400 pl-11">
                      <span>Hit post to immediately notify watchers.</span>
                      <span>{commentInput.length}/1000 chars</span>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column: Task Metadata Selectors */}
              <div className="w-full md:w-72 p-6 bg-slate-50/50 dark:bg-slate-900/10 flex-shrink-0 space-y-5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Task Attributes</h3>
                
                {/* Status Column selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Status</label>
                  <select
                    id="attribute-status-select"
                    value={task.status}
                    onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-550 transition font-medium"
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                {/* Priority Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Priority</label>
                  <select
                    id="attribute-priority-select"
                    value={task.priority}
                    onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-550 transition font-medium"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>

                {/* Assignee Selector with Person Insertion */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>Assignee</span>
                    </label>
                    <button
                      id="btn-toggle-add-person"
                      type="button"
                      onClick={() => setIsAddingNewUser(!isAddingNewUser)}
                      className="text-[10.5px] font-bold text-[#2563EB] hover:underline"
                    >
                      {isAddingNewUser ? 'Cancel' : '+ Add Person'}
                    </button>
                  </div>

                  {isAddingNewUser ? (
                    <form onSubmit={handleCreateAndAssignUser} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Invite & Assign Workspace Member</p>
                      {addUserError && <p className="text-red-500 font-bold text-[10px]">{addUserError}</p>}
                      <div className="space-y-1">
                        <input
                          id="new-person-name-input"
                          type="text"
                          placeholder="Full Name (e.g., Alex Carter)"
                          value={newPersonName}
                          onChange={(e) => setNewPersonName(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 dark:border-slate-850 rounded text-xs text-slate-950 dark:text-white bg-slate-50 dark:bg-slate-950 placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <input
                          id="new-person-role-input"
                          type="text"
                          placeholder="Designation / Role"
                          value={newPersonRole}
                          onChange={(e) => setNewPersonRole(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 dark:border-slate-850 rounded text-xs text-slate-950 dark:text-white bg-slate-50 dark:bg-slate-950 placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setIsAddingNewUser(false)}
                          className="px-2 py-1 border border-slate-205 dark:border-slate-800 text-[10px] font-bold text-slate-550 dark:text-slate-400 rounded cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          id="btn-submit-add-person"
                          type="submit"
                          className="px-2 py-1 bg-[#2563EB] hover:bg-blue-700 text-white text-[10px] font-bold rounded cursor-pointer transition-colors"
                        >
                          Add & Assign
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2">
                      {renderUserAvatar(task.assignee)}
                      <select
                        id="attribute-assignee-select"
                        value={task.assignee}
                        onChange={(e) => handleAssigneeChange(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition font-medium"
                      >
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Due Date picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Due Date</span>
                  </label>
                  <input
                    id="attribute-duedate-input"
                    type="date"
                    value={task.dueDate}
                    onChange={(e) => handleDueDateChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition font-medium"
                  />
                </div>

                {/* Progress Percentage Control */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>Task Percentage Progress</span>
                    <span className="font-extrabold text-[#2563EB] dark:text-blue-400">{task.percentage ?? 0}%</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={task.percentage ?? 0}
                      onChange={(e) => handlePercentageChange(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                    />
                    <input
                      id="progress-numerical-input"
                      type="number"
                      min="0"
                      max="100"
                      value={task.percentage ?? 0}
                      onChange={(e) => {
                        const val = Math.min(100, Math.max(0, Number(e.target.value)));
                        handlePercentageChange(val);
                      }}
                      className="w-12 text-center text-xs p-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded"
                    />
                  </div>
                </div>

                {/* Task Image/Cover Section */}
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  <label className="text-xs font-bold text-slate-400 block">Task Asset / Image</label>
                  
                  {task.imageUrl ? (
                    <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-855 max-h-36 bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center">
                      <img
                        src={task.imageUrl}
                        alt={task.title}
                        referrerPolicy="no-referrer"
                        className="max-h-24 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center">
                        <button
                          id="btn-remove-task-image"
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          Remove Asset Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg text-[9px] font-bold">
                        <button
                          type="button"
                          onClick={() => handlePresetImage('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80')}
                          className="p-1.5 rounded bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-750 dark:text-slate-300 shadow-xs transition cursor-pointer text-center"
                        >
                          Canvas Wave
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePresetImage('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80')}
                          className="p-1.5 rounded bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-750 dark:text-slate-300 shadow-xs transition cursor-pointer text-center"
                        >
                          Data Analytics
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePresetImage('https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80')}
                          className="p-1.5 rounded bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-750 dark:text-slate-300 shadow-xs transition cursor-pointer text-center"
                        >
                          Coding Screen
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePresetImage('https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80')}
                          className="p-1.5 rounded bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-750 dark:text-slate-300 shadow-xs transition cursor-pointer text-center"
                        >
                          UI Mockups
                        </button>
                      </div>

                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-12 border border-dashed border-slate-300 hover:border-slate-400 dark:border-slate-750 dark:hover:border-slate-650 rounded-lg cursor-pointer bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900/10 dark:hover:bg-slate-900/35 transition">
                          <span className="text-[10px] font-bold text-slate-500">Or Upload Image File</span>
                          <input
                            id="upload-task-image-file"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  handlePercentageImageChange(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Task ID:</span>
                    <span className="font-mono text-[10px] select-text">{task.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Due Timing:</span>
                    <span className="font-semibold text-slate-500 select-text">
                      {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
