/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Award,
  CheckSquare,
  AlertCircle,
  Clock,
  Briefcase,
  Users,
  ChevronRight,
  PieChart as PieIcon,
  BarChart2,
  Activity,
  User as UserIcon,
  ListTodo,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TaskStatus, TaskPriority } from '../types';

export default function Progress() {
  const { tasks, projects, users } = useApp();
  const [activeTab, setActiveTab] = useState<'status' | 'projects' | 'members'>('status');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null);

  // Helper metric calculators
  const stats = useMemo(() => {
    const total = tasks.length;
    if (total === 0) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        review: 0,
        todo: 0,
        backlog: 0,
        avgCompletion: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0
      };
    }

    const completed = tasks.filter(t => t.status === 'Done').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const review = tasks.filter(t => t.status === 'Review').length;
    const todo = tasks.filter(t => t.status === 'To Do').length;
    const backlog = tasks.filter(t => t.status === 'Backlog').length;

    // Calculate dynamic average task completion percentage (percentage)
    const sumCompletion = tasks.reduce((acc, t) => acc + (t.percentage ?? (t.status === 'Done' ? 100 : 0)), 0);
    const avgCompletion = Math.round(sumCompletion / total);

    const highPriority = tasks.filter(t => t.priority === 'High' && t.status !== 'Done').length;
    const mediumPriority = tasks.filter(t => t.priority === 'Medium' && t.status !== 'Done').length;
    const lowPriority = tasks.filter(t => t.priority === 'Low' && t.status !== 'Done').length;

    return {
      total,
      completed,
      inProgress,
      review,
      todo,
      backlog,
      avgCompletion,
      highPriority,
      mediumPriority,
      lowPriority
    };
  }, [tasks]);

  // Project Progress and Metrics list
  const projectStats = useMemo(() => {
    return projects.map(proj => {
      const projTasks = tasks.filter(t => t.projectId === proj.id);
      const total = projTasks.length;
      const completed = projTasks.filter(t => t.status === 'Done').length;
      const sumPercentage = projTasks.reduce((acc, t) => acc + (t.percentage ?? (t.status === 'Done' ? 100 : 0)), 0);
      const avgPercentage = total > 0 ? Math.round(sumPercentage / total) : 0;

      return {
        ...proj,
        totalTasks: total,
        completedTasks: completed,
        calculatedProgress: avgPercentage,
        highPriorityCount: projTasks.filter(t => t.priority === 'High' && t.status !== 'Done').length
      };
    }).sort((a, b) => b.calculatedProgress - a.calculatedProgress);
  }, [projects, tasks]);

  // Assignee Breakdown and velocity rates
  const memberWorkloadStats = useMemo(() => {
    return users.map(u => {
      const uTasks = tasks.filter(t => t.assignee === u.id);
      const totalCount = uTasks.length;
      const doneCount = uTasks.filter(t => t.status === 'Done').length;
      const sumPercentage = uTasks.reduce((acc, t) => acc + (t.percentage ?? (t.status === 'Done' ? 100 : 0)), 0);
      const avgPercent = totalCount > 0 ? Math.round(sumPercentage / totalCount) : 0;

      return {
        ...u,
        totalCount,
        doneCount,
        avgPercent,
        pendingCount: totalCount - doneCount
      };
    }).sort((a, b) => b.avgPercent - a.avgPercent);
  }, [users, tasks]);

  // Donut chart path parameters for Task Status Segment Ring
  const ringSegments = useMemo(() => {
    const total = stats.total;
    if (total === 0) return [];

    const rawData = [
      { name: 'Done', count: stats.completed, color: '#10B981', hoverColor: '#059669 bg-emerald-500' },
      { name: 'Review', count: stats.review, color: '#8B5CF6', hoverColor: '#7C3AED bg-violet-500' },
      { name: 'In Progress', count: stats.inProgress, color: '#3B82F6', hoverColor: '#2563EB bg-blue-500' },
      { name: 'To Do', count: stats.todo, color: '#F59E0B', hoverColor: '#D97706 bg-amber-500' },
      { name: 'Backlog', count: stats.backlog, color: '#94A3B8', hoverColor: '#64748B bg-slate-400' }
    ].filter(s => s.count > 0);

    let accumPercentage = 0;
    return rawData.map(item => {
      const percentage = (item.count / total) * 100;
      const startAngle = (accumPercentage / 100) * 360;
      const endAngle = ((accumPercentage + percentage) / 100) * 360;
      accumPercentage += percentage;

      // Convert angles to radian for SVG arc drawing coordinates
      const rad = Math.PI / 180;
      const x1 = 100 + 80 * Math.cos((startAngle - 90) * rad);
      const y1 = 100 + 80 * Math.sin((startAngle - 90) * rad);
      const x2 = 100 + 80 * Math.cos((endAngle - 90) * rad);
      const y2 = 100 + 80 * Math.sin((endAngle - 90) * rad);
      
      const largeArcFlag = percentage > 50 ? 1 : 0;
      const arcPath = `M ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`;

      return {
        ...item,
        percentage: Math.round(percentage),
        arcPath
      };
    });
  }, [stats]);

  // Priority Ratio indicators
  const priorityStatus = useMemo(() => {
    const total = stats.total;
    if (total === 0) return { high: 0, med: 0, low: 0 };
    return {
      high: Math.round((tasks.filter(t => t.priority === 'High').length / total) * 100),
      med: Math.round((tasks.filter(t => t.priority === 'Medium').length / total) * 100),
      low: Math.round((tasks.filter(t => t.priority === 'Low').length / total) * 100)
    };
  }, [tasks, stats.total]);

  // List tasks matching clicked donut segment
  const statusFilteringTasks = useMemo(() => {
    if (!selectedStatusFilter) return [];
    return tasks.filter(t => t.status === selectedStatusFilter);
  }, [tasks, selectedStatusFilter]);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#2563EB]" />
            <span>Workspace Progress & Velocity Charts</span>
          </h1>
          <p className="text-xs text-slate-500">
            Real-time analytics segmenting milestone logs, project scopes, team productivity metric menus.
          </p>
        </div>

        {/* Modular Menu Switch Subheader */}
        <div className="flex p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg">
          {[
            { id: 'status', label: 'Overall Status', icon: PieIcon },
            { id: 'projects', label: 'Projects Velocity', icon: Briefcase },
            { id: 'members', label: 'Team Productivity', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              id={`progress-tab-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedStatusFilter(null);
              }}
              className={`p-1.5 px-3 rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-[#2563EB] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main KPI Bar Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] p-4 border border-slate-200 dark:border-slate-805 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Average Completion Rate</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-950 dark:text-white">{stats.avgCompletion}%</span>
            <span className="text-[10px] text-slate-405 font-semibold">weighted avg</span>
          </div>
          {/* Completion Bar */}
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-blue-500 to-emerald-500 rounded-full"
              style={{ width: `${stats.avgCompletion}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4 border border-slate-200 dark:border-slate-805 rounded-xl shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Working Bottlenecks</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-500">{stats.highPriority}</span>
            <span className="text-[10px] text-slate-405 font-bold">High Priority Tasks</span>
          </div>
          <div className="text-[10px] text-slate-400">Exclude finished done milestones</div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4 border border-slate-200 dark:border-slate-805 rounded-xl shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Task Execution Ratio</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-500">{stats.completed}</span>
            <span className="text-xs text-slate-405">/ {stats.total} Total</span>
          </div>
          <div className="text-[10px] text-slate-400">{stats.total - stats.completed} items pending in loop</div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4 border border-slate-200 dark:border-slate-805 rounded-xl shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Workspace Projects</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#2563EB] dark:text-blue-400">{projects.length}</span>
            <span className="text-[10px] text-slate-405 font-bold">Operational Scope</span>
          </div>
          <div className="text-[10px] text-slate-400">With {users.length} active team members</div>
        </div>
      </div>

      {/* Main Analysis Sections relative to activeTab */}
      {tasks.length === 0 ? (
        <div className="bg-white dark:bg-[#1E293B] border border-dashed border-slate-200 dark:border-slate-800 p-12 rounded-xl text-center">
          <ListTodo className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">No charts or analytics available</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Please add workspace projects and tasks with percentage values to populate dynamic charts dynamically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Dynamic Tab Panel Left Layout (Takes 2 Columns) */}
          <div className="lg:col-span-2 space-y-5">
            {activeTab === 'status' && (
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 p-5 rounded-2xl shadow-xs space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-905 dark:text-white">Workspace Task Status Segment Arc</h3>
                    <p className="text-[10px] text-slate-400">Click any interactive slice to view associated task details.</p>
                  </div>
                  {selectedStatusFilter && (
                    <button
                      id="clear-segment-filter-btn"
                      onClick={() => setSelectedStatusFilter(null)}
                      className="text-[10px] font-bold text-[#2563EB] hover:underline"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-around gap-6 pt-2">
                  {/* Custom Hand-Crafted SVG Segment Donut Chart */}
                  <div className="relative w-48 h-48 flex-shrink-0">
                    <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-10">
                      {/* Placeholder background ring */}
                      {ringSegments.length === 0 && (
                        <circle cx="100" cy="100" r="80" fill="none" stroke="#e2e8f0" strokeWidth="16" />
                      )}

                      {ringSegments.map((seg, i) => (
                        <path
                          key={i}
                          d={seg.arcPath}
                          fill="none"
                          stroke={seg.color}
                          strokeWidth={selectedStatusFilter === seg.name ? "24" : "16"}
                          className="transition-all duration-250 cursor-pointer hover:stroke-[22px]"
                          onClick={() => {
                            setSelectedStatusFilter(seg.name === selectedStatusFilter ? null : seg.name);
                          }}
                          title={`${seg.name}: ${seg.count} tasks (${seg.percentage}%)`}
                        />
                      ))}
                      
                      {/* Inner Ring labeling */}
                      <circle cx="100" cy="100" r="54" fill="transparent" />
                    </svg>

                    {/* Donut Center Core Labels */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                        {selectedStatusFilter ? selectedStatusFilter : 'Total Goals'}
                      </span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                        {selectedStatusFilter 
                          ? stats[selectedStatusFilter.toLowerCase().replace(/\s+/g, '') as keyof typeof stats] ?? 0 
                          : stats.total
                        }
                      </span>
                      <span className="text-[9px] text-slate-400 mt-1">tasks tracked</span>
                    </div>
                  </div>

                  {/* Segment Details & Legends Menu */}
                  <div className="flex-1 space-y-2.5 w-full">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Interactive Legend Menu</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { name: 'Done', count: stats.completed, percent: Math.round((stats.completed/stats.total)*100), color: 'bg-emerald-500' },
                        { name: 'Review', count: stats.review, percent: Math.round((stats.review/stats.total)*100), color: 'bg-violet-500' },
                        { name: 'In Progress', count: stats.inProgress, percent: Math.round((stats.inProgress/stats.total)*100), color: 'bg-blue-500' },
                        { name: 'To Do', count: stats.todo, percent: Math.round((stats.todo/stats.total)*100), color: 'bg-amber-500' },
                        { name: 'Backlog', count: stats.backlog, percent: Math.round((stats.backlog/stats.total)*100), color: 'bg-slate-400' }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          id={`segment-btn-${item.name.toLowerCase().replace(/\s+/g, '')}`}
                          onClick={() => setSelectedStatusFilter(selectedStatusFilter === item.name ? null : item.name)}
                          className={`flex items-center justify-between p-2 rounded-lg border text-left transition ${
                            selectedStatusFilter === item.name 
                              ? 'border-[#2563EB] bg-blue-50/40 dark:bg-blue-955/20'
                              : 'border-slate-100 hover:border-slate-202 dark:border-slate-805 dark:hover:border-slate-750 bg-slate-50/50 dark:bg-slate-900/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                            <span className="text-xs font-bold text-slate-750 dark:text-slate-200">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-black">{item.count}</span>
                            <span className="text-[9px] text-slate-400 font-medium">({item.percent || 0}%)</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Listing Segment Specific Tasks */}
                <AnimatePresence mode="wait">
                  {selectedStatusFilter && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-100 dark:border-slate-800 pt-3.5 space-y-2 overflow-hidden"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <ListTodo className="w-3.5 h-3.5" />
                          <span>Goal List: {selectedStatusFilter} Tasks ({statusFilteringTasks.length})</span>
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {statusFilteringTasks.length === 0 ? (
                          <p className="text-center py-4 text-xs text-slate-400">No tasks currently set in {selectedStatusFilter} stage.</p>
                        ) : (
                          statusFilteringTasks.map((t) => {
                            const p = projects.find(proj => proj.id === t.projectId);
                            return (
                              <div key={t.id} className="flex justify-between items-center p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850">
                                <div className="space-y-0.5">
                                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[280px]">{t.title}</p>
                                  <span className="text-[9px] text-[#2563EB] font-bold uppercase">{p?.name || 'Workspace'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-slate-405">Progress {t.percentage ?? 0}%</span>
                                  <span className="text-[9px] text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-1 py-0.5 rounded font-medium">{t.dueDate.substring(5)}</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 p-5 rounded-2xl shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-905 dark:text-white">Workspace Projects Velocity</h3>
                  <p className="text-[10px] text-slate-400">Aggregated task completion schedules sorted by layout velocity.</p>
                </div>

                <div className="space-y-3">
                  {projectStats.map((p) => {
                    return (
                      <div key={p.id} className="p-3.5 border border-slate-100 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-900/10 rounded-xl space-y-2">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5">
                          <div>
                            <h4 className="text-xs font-bold text-slate-950 dark:text-white">{p.name}</h4>
                            <span className="text-[10px] text-slate-400 font-medium">Due: {p.dueDate} • {p.totalTasks} Tasks active</span>
                          </div>
                          
                          <div className="flex gap-2 items-center flex-shrink-0">
                            {p.highPriorityCount > 0 && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-650 dark:bg-rose-950/20 dark:text-rose-450 border border-rose-100/10">
                                {p.highPriorityCount} High Priority
                              </span>
                            )}
                            <span className="text-xs font-black text-[#2563EB] dark:text-blue-400">
                              {p.calculatedProgress}% Done
                            </span>
                          </div>
                        </div>

                        {/* Beautiful progress slide-bar with dynamic background matching density */}
                        <div className="relative w-full h-2 bg-slate-150 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              p.calculatedProgress === 100 
                                ? 'bg-emerald-500' 
                                : p.calculatedProgress > 50 
                                ? 'bg-indigo-500' 
                                : 'bg-[#2563EB]'
                            }`}
                            style={{ width: `${p.calculatedProgress}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                          <span>{p.completedTasks} of {p.totalTasks} goals cleared</span>
                          <span>Member size: {p.members?.length || 0}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 p-5 rounded-2xl shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-905 dark:text-white">Workspace Team Productivity</h3>
                  <p className="text-[10px] text-slate-400">Performance ratings computed from total assigned task completion percentages.</p>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {memberWorkloadStats.map((item, idx) => {
                    return (
                      <div key={item.id} className="py-3 flex flex-col sm:flex-row justify-between gap-3 text-xs">
                        <div className="flex gap-2.5 items-center">
                          <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/40 text-[#2563EB] dark:text-blue-400 font-extrabold text-[10px] flex items-center justify-center border border-white">
                            {item.avatar}
                          </span>
                          <div>
                            <p className="font-extrabold text-slate-855 dark:text-white">{item.name}</p>
                            <span className="text-[10px] text-slate-400">{item.role}</span>
                          </div>
                        </div>

                        {/* Quantitative performance analytics */}
                        <div className="flex flex-1 max-w-sm gap-4 items-center justify-between sm:justify-end">
                          <div className="space-y-1 text-left sm:text-right">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Success weight</span>
                            <span className="font-bold text-slate-800 dark:text-white">{item.avgPercent}% Average</span>
                          </div>

                          <div className="space-y-1 text-right">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Workload allocation</span>
                            <span className="font-semibold text-slate-750 dark:text-slate-350">
                              {item.totalCount} Tasks ({item.doneCount} Cleared)
                            </span>
                          </div>

                          {/* Workspace Ranking Medal Badge */}
                          <div className="flex-shrink-0">
                            {idx === 0 ? (
                              <span className="p-1 px-1.5 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 text-[10px] font-extrabold rounded-md flex items-center gap-1 border border-amber-200">
                                🥇 Star Peak
                              </span>
                            ) : idx === 1 ? (
                              <span className="p-1 px-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 text-[10px] font-extrabold rounded-md flex items-center gap-1">
                                🥈 Core Speed
                              </span>
                            ) : (
                              <span className="p-1 px-1.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-bold rounded-md">
                                Lead
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Priority Ratio indicators and workspace Burn-down metrics */}
          <div className="space-y-5">
            {/* Priority workload share */}
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 p-4 rounded-xl shadow-xs space-y-3.5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <span>Priority Allocation Ratio</span>
              </h3>

              <div className="space-y-3.5">
                {[
                  { label: 'High Priority workload', value: priorityStatus.high, color: 'bg-rose-500' },
                  { label: 'Medium Priority workload', value: priorityStatus.med, color: 'bg-amber-500' },
                  { label: 'Low Priority workload', value: priorityStatus.low, color: 'bg-[#2563EB]' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                      <span className="text-slate-905 dark:text-white">{item.value}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800/60 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Micro burn-down milestones calendar status */}
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 p-4 rounded-xl shadow-xs space-y-3.5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-405" />
                <span>Weekly Burn-down Indicators</span>
              </h3>

              <div className="space-y-2.5">
                <p className="text-[10px] text-slate-400">
                  Approximate weekly productivity targets relative to total backlog allocation schedules.
                </p>

                <div className="border border-slate-100 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-900/10 p-2.5 rounded-lg space-y-1.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">NEXT TARGET</span>
                    <span className="font-extrabold text-slate-855 dark:text-slate-200">Done Rate &gt; 80%</span>
                  </div>
                  <span className="p-1 px-1.5 bg-blue-50 dark:bg-blue-950/20 text-[#2563EB] text-[9px] font-bold rounded">
                    {stats.avgCompletion >= 80 ? 'Perfect!' : `${80 - stats.avgCompletion}% left`}
                  </span>
                </div>

                <div className="border border-slate-100 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-900/10 p-2.5 rounded-lg space-y-1.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">ESTIMATED CYCLE TIME</span>
                    <span className="font-extrabold text-slate-855 dark:text-slate-200">3.5 Business Days</span>
                  </div>
                  <span className="p-1 px-1.5 bg-slate-200/50 dark:bg-slate-800 text-slate-505 text-[9px] font-bold rounded">
                    Normal
                  </span>
                </div>
              </div>
            </div>

            {/* Quick action button redirects */}
            <div className="bg-[#2563EB]/5 border border-blue-100 dark:border-blue-950/20 p-4 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-[#2563EB] dark:text-blue-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  <span>Tasks are dragging?</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Move statuses directly inside tasks board.</p>
              </div>
              <a
                href="/tasks"
                className="w-8 h-8 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-xs"
              >
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
