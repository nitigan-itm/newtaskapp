/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  Activity,
  Heart,
  ExternalLink,
  ChevronRight,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, User } from '../types';

export default function UserProgress() {
  const { tasks, users, projects } = useApp();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Compute stats for all users
  const userProgressList = useMemo(() => {
    return users.map(user => {
      const uTasks = tasks.filter(t => t.assignee === user.id);
      const total = uTasks.length;
      const completed = uTasks.filter(t => t.status === 'Done').length;
      const inProgress = uTasks.filter(t => t.status === 'In Progress').length;
      const review = uTasks.filter(t => t.status === 'Review').length;
      const todo = uTasks.filter(t => t.status === 'To Do').length;
      const backlog = uTasks.filter(t => t.status === 'Backlog').length;

      // Sum and average percentage completion
      const totalPercentage = uTasks.reduce((acc, t) => acc + (t.percentage ?? (t.status === 'Done' ? 100 : 0)), 0);
      const averagePercent = total > 0 ? Math.round(totalPercentage / total) : 0;

      return {
        user,
        total,
        completed,
        inProgress,
        review,
        todo,
        backlog,
        averagePercent,
        tasksList: uTasks
      };
    }).sort((a, b) => b.averagePercent - a.averagePercent); // Sort by highest average completion percentage
  }, [users, tasks]);

  // Selected user details for detailed view
  const activeUserStats = useMemo(() => {
    const actId = selectedUserId || (userProgressList[0]?.user.id);
    return userProgressList.find(item => item.user.id === actId);
  }, [userProgressList, selectedUserId]);

  // Overall workspace stats
  const aggregateStats = useMemo(() => {
    const totalAssigned = tasks.filter(t => t.assignee).length;
    const totalCompleted = tasks.filter(t => t.assignee && t.status === 'Done').length;
    const avgWorkspacePercent = userProgressList.length > 0 
      ? Math.round(userProgressList.reduce((acc, curr) => acc + curr.averagePercent, 0) / userProgressList.length)
      : 0;

    return {
      totalAssigned,
      totalCompleted,
      avgWorkspacePercent
    };
  }, [tasks, userProgressList]);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header section with branding and help text */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#2563EB]" />
            <span>Workspace User Progress Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500">
            Public workspace dashboard measuring active progress, workloads, and performance rankings of all team members.
          </p>
        </div>
      </div>

      {/* Aggregate Overview KPI Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1E293B] p-4 border border-slate-200 dark:border-slate-805 rounded-xl shadow-xs space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Average Team Progress</span>
            <TrendingUp className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-950 dark:text-white">{aggregateStats.avgWorkspacePercent}%</span>
            <span className="text-[10px] text-slate-400">workspace score</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 h-1 rounded-full overflow-hidden">
            <div className="bg-[#2563EB] h-full" style={{ width: `${aggregateStats.avgWorkspacePercent}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4 border border-slate-200 dark:border-slate-805 rounded-xl shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Workspace Members</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-950 dark:text-white">{users.length}</span>
            <span className="text-[10px] text-slate-400">operational accounts</span>
          </div>
          <p className="text-[10px] text-slate-450 truncate">All items are publicly viewable across general streams.</p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4 border border-slate-200 dark:border-slate-805 rounded-xl shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Task Assignment Rate</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-500">{aggregateStats.totalCompleted}</span>
            <span className="text-xs text-slate-455 font-bold">/ {aggregateStats.totalAssigned} assigned done</span>
          </div>
          <p className="text-[10px] text-slate-400">
            {aggregateStats.totalAssigned - aggregateStats.totalCompleted} operations pending team resolution
          </p>
        </div>
      </div>

      {/* Global Comparative Productivity Graph */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 rounded-2xl p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-[#2563EB] dark:text-blue-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>Workspace Productivity Comparison Chart</span>
            </h2>
            <p className="text-[10px] text-slate-450 mt-0.5">Comparing real-time task progress and milestone success ratings across all roles.</p>
          </div>
          <div className="text-[10px] font-extrabold text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-1 px-2.5 rounded-lg">
            Active Members: {userProgressList.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* 3D-Look Relative Volume Bar Graph */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Goal Completion % Bar Graph</p>
            <div className="space-y-3">
              {userProgressList.map((item, index) => (
                <div key={item.user.id} className="space-y-1 group">
                  <div className="flex justify-between text-xs font-bold text-slate-750 dark:text-slate-200">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="text-[10px] font-black text-slate-400 w-4">#{index+1}</span>
                      <span className="font-extrabold">{item.user.name}</span>
                      <span className="text-[9px] text-slate-400 font-medium px-1.5 py-0.2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">{item.user.role}</span>
                    </span>
                    <span className="font-extrabold text-[#2563EB] dark:text-blue-400">{item.averagePercent}%</span>
                  </div>
                  
                  {/* Progress segment indicator */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 w-full bg-slate-100 dark:bg-slate-850 h-3.5 rounded-lg overflow-hidden relative flex items-center">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.averagePercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.05 }}
                        className={`h-full rounded-lg bg-gradient-to-r ${
                          item.averagePercent >= 80 
                            ? 'from-emerald-500 to-emerald-600' 
                            : item.averagePercent >= 50 
                            ? 'from-blue-500 to-indigo-600' 
                            : 'from-amber-500 to-orange-600'
                        }`}
                      />
                      <span className="absolute left-2.5 text-[8.5px] font-black text-slate-905 dark:text-gray-100 drop-shadow-xs">
                        {item.completed} of {item.total} complete
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Workload comparative chart bubble scale */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Relative Team Activity Scales</p>
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/35 border border-slate-100 dark:border-slate-850 rounded-xl space-y-4">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 border-b border-slate-150 dark:border-slate-800 pb-1.5">
                <span>Team Member</span>
                <span>Workload / Task Ratios</span>
              </div>
              <div className="space-y-3">
                {userProgressList.map((item, index) => {
                  const totalCount = item.total;
                  const ratio = totalCount > 0 ? (item.completed / totalCount) * 100 : 0;
                  
                  return (
                    <div key={item.user.id} className="flex justify-between items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[9px] flex items-center justify-center">
                          {item.user.avatar}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.user.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-slate-450">
                          {item.completed} done / {item.total} assigned
                        </span>
                        
                        <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#2563EB] h-full" 
                            style={{ width: `${ratio}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Interface Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Layout Panel (Team Performance List & Progress Stats) - Takes 5 cols */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 rounded-2xl shadow-xs p-4 space-y-3.5">
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Team Leaderboard Rank</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Ranked dynamically by average task completion weights.</p>
            </div>

            <div className="space-y-2">
              {userProgressList.map((item, idx) => {
                const isActive = activeUserStats?.user.id === item.user.id;
                
                return (
                  <div
                    key={item.user.id}
                    id={`leaderboard-user-${item.user.id}`}
                    onClick={() => setSelectedUserId(item.user.id)}
                    className={`p-3 border rounded-xl flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                      isActive 
                        ? 'bg-blue-50/50 dark:bg-blue-955/15 border-[#2563EB]' 
                        : 'bg-slate-50/50 dark:bg-slate-900/10 border-slate-100 hover:border-slate-202 dark:border-slate-805 dark:hover:border-slate-750'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Rank ribbon */}
                      <span className="text-[11px] font-bold text-slate-450 w-4 text-center">
                        #{idx + 1}
                      </span>

                      {/* Avatar initials representation */}
                      <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[#2563EB] dark:text-blue-400 text-xs font-extrabold flex items-center justify-center border border-white">
                        {item.user.avatar}
                      </span>

                      {/* Name/Role info */}
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.user.name}</p>
                        <p className="text-[9.5px] text-slate-400 truncate">{item.user.role}</p>
                      </div>
                    </div>

                    {/* Progress representation percentages */}
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900 dark:text-white block">
                        {item.averagePercent}%
                      </span>
                      <span className="text-[9.5px] text-slate-400 font-bold block">
                        {item.completed}/{item.total} Done
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Layout Panel (Active Member In-Depth Analysis) - Takes 7 cols */}
        <div className="lg:col-span-7">
          {activeUserStats ? (
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 rounded-2xl shadow-xs p-5 space-y-5">
              
              {/* Member Core Profile Information */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex gap-3 items-center">
                  <span className="w-12 h-12 rounded-full bg-[#2563EB] text-white text-base font-black flex items-center justify-center shadow-xs">
                    {activeUserStats.user.avatar}
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{activeUserStats.user.name}</span>
                      <span className="p-0.5 px-1.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                        {activeUserStats.user.role}
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-400">{activeUserStats.user.email}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-450 uppercase block tracking-wider">Productivity Level</span>
                  <span className="text-lg font-black text-[#2563EB] dark:text-blue-400">{activeUserStats.averagePercent}% Score</span>
                </div>
              </div>

              {/* Graphical distribution profile */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Workload Distribution Status</span>
                
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold">
                  {[
                    { label: 'Backlog', count: activeUserStats.backlog, color: 'bg-slate-400 text-white' },
                    { label: 'To Do', count: activeUserStats.todo, color: 'bg-amber-500 text-white' },
                    { label: 'In Progress', count: activeUserStats.inProgress, color: 'bg-blue-500 text-white' },
                    { label: 'Review', count: activeUserStats.review, color: 'bg-violet-500 text-white' },
                    { label: 'Done', count: activeUserStats.completed, color: 'bg-emerald-500 text-white' }
                  ].map((col, k) => (
                    <div key={k} className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-lg space-y-1">
                      <span className="text-[8.5px] text-slate-400 block uppercase tracking-wide truncate">{col.label}</span>
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full mx-auto font-black text-xs ${col.color}`}>
                        {col.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completion Progress Bar */}
              <div className="space-y-1.5 bg-slate-50/40 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-855 p-3 rounded-xl">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Relative Schedule completion progress</span>
                  <span className="text-[#2563EB] dark:text-blue-400 font-extrabold">{activeUserStats.averagePercent}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${activeUserStats.averagePercent}%` }}
                    className="bg-[#2563EB] h-full rounded-full transition-all duration-300"
                  />
                </div>
              </div>

              {/* Task list details */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-slate-400" />
                  <span>Assigned Work Checklist ({activeUserStats.tasksList.length} tasks)</span>
                </span>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {activeUserStats.tasksList.length === 0 ? (
                    <p className="text-center py-6 text-xs text-slate-405">This user is currently free from direct assignments.</p>
                  ) : (
                    activeUserStats.tasksList.map((task) => {
                      const proj = projects.find(p => p.id === task.projectId);

                      return (
                        <div key={task.id} className="p-3 border border-slate-100 dark:border-slate-850/80 bg-slate-50/40 dark:bg-slate-900/10 rounded-lg flex justify-between items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{task.title}</p>
                            <span className="text-[9px] text-[#2563EB] dark:text-blue-400 uppercase font-black">{proj?.name || 'Workspace'}</span>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] text-slate-450 font-extrabold whitespace-nowrap bg-transparent">
                              {task.percentage ?? (task.status === 'Done' ? 100 : 0)}%
                            </span>
                            
                            <span className={`px-1.5 py-0.5 text-[8.5px] font-black rounded uppercase tracking-wide ${
                              task.status === 'Done' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                              task.status === 'Review' ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400' :
                              task.status === 'In Progress' ? 'bg-blue-50 text-blue-750 dark:bg-blue-950/20 dark:text-blue-400' :
                              'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-[#1E293B] border border-dashed border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center">
              <span className="text-xs text-slate-500">Select a team member to view their interactive live progress analytics.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
