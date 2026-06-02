/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Briefcase,
  CheckSquare,
  AlertCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Award,
  Plus,
  Users,
  Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import CreateProjectModal from '../components/CreateProjectModal';

export default function Dashboard() {
  const { projects, tasks, activities, users, currentUser } = useApp();
  const navigate = useNavigate();
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  // Stats Calculations
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const reviewTasks = tasks.filter(t => t.status === 'Review').length;
  const todoTasks = tasks.filter(t => t.status === 'To Do').length;
  const backlogTasks = tasks.filter(t => t.status === 'Backlog').length;
  const activeTasks = totalTasks - doneTasks;
  
  // High priority task count
  const urgentTasks = tasks.filter(t => t.status !== 'Done' && t.priority === 'High');

  // Format date helper
  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate project list members helper
  const renderMembersAvatars = (memberIds: string[], limit = 3) => {
    return (
      <div className="flex -space-x-2 overflow-hidden">
        {memberIds.slice(0, limit).map((id) => {
          const m = users.find(u => u.id === id);
          if (!m) return null;
          const initials = m.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
          return (
            <div
              key={id}
              className="inline-block h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-705 border-2 border-white dark:border-slate-800 text-[8px] font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer"
              title={m.name}
            >
              {initials}
            </div>
          );
        })}
        {memberIds.length > limit && (
          <div className="flex items-center justify-center inline-block h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-800 text-[8px] font-bold text-slate-500">
            +{memberIds.length - limit}
          </div>
        )}
      </div>
    );
  };

  // Find nearest 3 deadlines
  const upcomingDeadlines = [...tasks]
    .filter(t => t.status !== 'Done')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  // Recent 4 tasks
  const recentTasks = [...tasks].slice(-4).reverse();

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'High': return 'text-red-650 bg-red-50 dark:text-red-400 dark:bg-red-950/20';
      case 'Medium': return 'text-amber-650 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20';
      default: return 'text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-800/40';
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'Done': return 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20';
      case 'Review': return 'text-purple-700 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/20';
      case 'In Progress': return 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20';
      default: return 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800/50';
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <p className="text-[10px] font-bold text-[#2563EB] dark:text-blue-400 uppercase tracking-widest">{formattedToday}</p>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-xs text-slate-500">
            Current operational team overview for this workspace session.
          </p>
        </div>

        <button
          id="dashboard-new-project-btn"
          onClick={() => setIsNewProjectOpen(true)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-sm shadow-blue-500/10 hover:shadow transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Core KPI metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: totalProjects, desc: 'Active Workspace Units', icon: Briefcase, color: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/20' },
          { label: 'Active Goals', value: activeTasks, desc: `${todoTasks} ToDo / ${inProgressTasks} Progress`, icon: CheckSquare, color: 'text-[#2563EB] bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20' },
          { label: 'Tasks Completed', value: doneTasks, desc: `${totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}% success rate`, icon: Award, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20' },
          { label: 'Urgent Bottlenecks', value: urgentTasks.length, desc: 'High priority active items', icon: AlertCircle, color: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#1E293B] p-4 border border-slate-200 dark:border-slate-805 rounded-xl flex items-center justify-between shadow-sm">
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{stat.value}</p>
              <p className="text-[10px] text-slate-400 font-medium">{stat.desc}</p>
            </div>
            <div className={`p-2.5 rounded-lg ${stat.color} flex-shrink-0`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard Sub-Splitted layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Double-Column area: Projects Summary and Recent Tasks */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Active Projects section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-[#2563EB]" />
                <span>Operational Projects</span>
              </h2>
              <button
                id="view-all-projects-lnk"
                onClick={() => navigate('/projects')}
                className="text-[11px] font-bold text-[#2563EB] hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="bg-white dark:bg-[#1E293B] border border-dashed border-slate-200 dark:border-slate-800 p-6 rounded-xl text-center">
                <p className="text-xs text-slate-400">No active projects yet. Add your first project launchpad!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {projects.slice(0, 4).map((p) => {
                  return (
                    <div
                      id={`project-card-${p.id}`}
                      key={p.id}
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 p-4 rounded-xl cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors space-y-3 shadow-sm flex flex-col justify-between min-h-[140px]"
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white hover:text-[#2563EB] transition-colors line-clamp-1">
                            {p.name}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Due {p.dueDate}</span>
                        </div>
                        
                        <p className="text-xs text-slate-500 line-clamp-2 leading-normal">
                          {p.description || 'No detailed layout description sets.'}
                        </p>
                      </div>

                      <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/40">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold">
                            <span className="text-slate-400 uppercase">Completion</span>
                            <span className="text-[#2563EB] dark:text-blue-400">{p.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div
                              className="bg-[#2563EB] h-full rounded-full transition-all duration-200"
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-bold">
                            {tasks.filter(t => t.projectId === p.id).length} Tasks
                          </span>
                          {renderMembersAvatars(p.members)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Tasks list view */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-[#2563EB]" />
                <span>Recent Activity Tasks</span>
              </h2>
            </div>

            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 rounded-xl overflow-hidden shadow-sm">
              {recentTasks.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">No tasks tracked yet.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentTasks.map((t) => {
                    const taskProj = projects.find(p => p.id === t.projectId);
                    return (
                      <div
                        key={t.id}
                        onClick={() => navigate(`/projects/${t.projectId}?task=${t.id}`)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/10 cursor-pointer gap-2 transition-colors"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={t.title}>{t.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-bold truncate max-w-[120px]">
                              {taskProj?.name || 'Workspace'}
                            </span>
                            <span>•</span>
                            <span>Due {t.dueDate}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                          <span className={`px-2 py-0.5 text-[9px] rounded font-bold border border-transparent ${getPriorityBadge(t.priority)}`}>
                            {t.priority}
                          </span>
                          <span className={`px-2 py-0.5 text-[9px] rounded font-bold border border-transparent ${getStatusBadge(t.status)}`}>
                            {t.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Deadlines tracker and Live Activity logs */}
        <div className="space-y-5">
          
          {/* Upcoming Deadlines */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Upcoming Deadlines</span>
            </h2>

            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 p-4 rounded-xl space-y-3.5 shadow-sm">
              {upcomingDeadlines.length === 0 ? (
                <div className="py-4 text-center text-slate-450 text-xs">No pending due dates.</div>
              ) : (
                upcomingDeadlines.map((t) => {
                  const daysLeft = Math.ceil(
                    (new Date(t.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={t.id}
                      onClick={() => navigate(`/projects/${t.projectId}?task=${t.id}`)}
                      className="flex items-start gap-3 border-b border-slate-100 dark:border-slate-800/40 pb-3 last:border-b-0 last:pb-0 h cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${daysLeft < 3 ? 'bg-red-500' : 'bg-amber-400'}`} />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate" title={t.title}>{t.title}</p>
                        <p className="text-[10px] text-slate-400">
                          {daysLeft < 0 ? (
                            <span className="text-red-500 font-semibold">Overdue by {Math.abs(daysLeft)} days</span>
                          ) : daysLeft === 0 ? (
                            <span className="text-amber-500 font-semibold">Due Today!</span>
                          ) : (
                            <span>Due in {daysLeft} days ({t.dueDate})</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chronological live workspace activity */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-505" />
              <span>Team Workspace Activity</span>
            </h2>

            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 p-4 rounded-xl shadow-sm">
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {activities.length === 0 ? (
                  <p className="text-center py-4 text-slate-400 text-xs">No activity logs recorded.</p>
                ) : (
                  activities.slice(0, 10).map((log) => {
                    const actor = users.find(u => u.id === log.userId);
                    const formattedLogTime = new Date(log.timestamp).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    });

                    return (
                      <div key={log.id} className="flex gap-2 items-start text-xs text-slate-600 dark:text-slate-300 leading-snug">
                        <span className="w-5.5 h-5.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold text-[9px] flex-shrink-0">
                          {actor?.avatar || 'SYS'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-[11px]">
                            <span className="font-bold text-slate-805 dark:text-white mr-1">{actor?.name}</span>
                            <span>{log.action}</span>
                            <span className="font-semibold text-[#2563EB] dark:text-blue-400 ml-1">{log.targetName}</span>
                          </p>
                          <span className="text-[9px] text-slate-400">{formattedLogTime}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Creation Project Modal Link */}
      <CreateProjectModal isOpen={isNewProjectOpen} onClose={() => setIsNewProjectOpen(false)} />
    </div>
  );
}
