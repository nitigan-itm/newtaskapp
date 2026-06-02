/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  FolderKanban,
  Plus,
  Search,
  Calendar,
  Layers,
  Trash2,
  Users,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import CreateProjectModal from '../components/CreateProjectModal';

export default function Projects() {
  const { projects, tasks, users, deleteProject } = useApp();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Completed'>('All');

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); // prevent card navigation
    if (confirm(`Are you sure you want to delete "${name}"? This will erase all cards and comments associated with it.`)) {
      deleteProject(id);
    }
  };

  // Filter list
  const filteredProjects = projects.filter(p => {
    const matchesKeyword = p.name.toLowerCase().includes(localSearch.toLowerCase()) ||
                           p.description.toLowerCase().includes(localSearch.toLowerCase());
    
    if (!matchesKeyword) return false;

    if (statusFilter === 'Completed') {
      return p.progress === 100;
    } else if (statusFilter === 'Active') {
      return p.progress < 100;
    }
    return true;
  });

  // Members render avatars
  const renderMembers = (memberIds: string[], limit = 4) => {
    return (
      <div className="flex -space-x-1.5 overflow-hidden">
        {memberIds.slice(0, limit).map(id => {
          const u = users.find(user => user.id === id);
          if (!u) return null;
          return (
            <div
              key={id}
              className="w-5.5 h-5.5 rounded-full bg-blue-600 border border-white dark:border-slate-800 text-[8px] font-black text-white flex items-center justify-center cursor-help"
              title={`${u.name} (${u.role})`}
            >
              {u.avatar}
            </div>
          );
        })}
        {memberIds.length > limit && (
          <div className="w-5.5 h-5.5 rounded-full bg-slate-100 border border-white text-[8px] font-bold text-slate-500 flex items-center justify-center">
            +{memberIds.length - limit}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-505" />
            <span>Workspace Projects</span>
          </h1>
          <p className="text-sm text-slate-500">
            Organize team workflows, milestones, and task distributions.
          </p>
        </div>

        <button
          id="projects-create-project-btn"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-500/15 hover:shadow-lg transition cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Control row with Filters and Keyword Search */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-sm">
        
        {/* Status groups */}
        <div className="flex gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-lg w-full md:w-auto">
          {(['All', 'Active', 'Completed'] as const).map(tab => {
            const isActive = statusFilter === tab;
            return (
              <button
                id={`projects-filter-${tab.toLowerCase()}`}
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`flex-1 md:flex-none px-3.5 py-1.5 text-xs font-bold rounded transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#2563EB] text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                {tab} Projects
              </button>
            );
          })}
        </div>

        {/* Global Keyword box */}
        <div className="relative w-full md:w-72">
          <input
            id="projects-search-input"
            type="text"
            placeholder="Search projects by name..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-90s dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-550 transition"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Projects Grid of Cards */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-[#1E293B] border border-dashed border-slate-200 dark:border-slate-800 py-16 px-4 rounded-3xl text-center">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-none" />
          <h2 className="text-base font-bold text-slate-870 dark:text-slate-300">No project setups match</h2>
          <p className="text-xs text-slate-400 mt-1">Try resetting the keyword filter or add a fresh team workspace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((p) => {
            const projectTasks = tasks.filter(t => t.projectId === p.id);
            const doneCount = projectTasks.filter(t => t.status === 'Done').length;
            
            return (
              <div
                id={`project-item-${p.id}`}
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-805 rounded-xl p-4 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition flex flex-col justify-between h-48 cursor-pointer shadow-sm"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 hover:text-[#2563EB] transition-colors">
                      {p.name}
                    </h2>
                    <button
                      id={`delete-project-btn-${p.id}`}
                      onClick={(e) => handleDelete(e, p.id, p.name)}
                      className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      title="Delete Project Launcher"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {p.description || 'No summary overview provided.'}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/40">
                  {/* Progress info */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold">
                      <span className="text-slate-400 uppercase">Operational Progress</span>
                      <span className="text-[#2563EB] dark:text-blue-400">{p.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#2563EB] h-full rounded-full transition-all duration-200"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Date and details row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-405 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{p.dueDate}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-800 dark:text-white leading-none">
                          {doneCount}/{projectTasks.length}
                        </p>
                        <p className="text-[8px] text-slate-400 uppercase font-bold tracking-wide leading-none mt-0.5">Tasks</p>
                      </div>
                      {renderMembers(p.members)}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal Injection */}
      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
