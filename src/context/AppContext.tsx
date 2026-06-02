/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Project, Task, Comment, ActivityLog, TaskStatus } from '../types';
import {
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_COMMENTS,
  INITIAL_ACTIVITIES,
} from '../data/mockData';

interface AppContextType {
  users: User[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  activities: ActivityLog[];
  currentUser: User | null;
  searchQuery: string;
  theme: 'light' | 'dark' | 'warm';
  notificationsEnabled: boolean;
  setSearchQuery: (query: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'warm') => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addProject: (name: string, description: string, members: string[], dueDate: string) => Project;
  addTask: (title: string, description: string, projectId: string, priority: 'Low' | 'Medium' | 'High', assigneeId: string, dueDate: string, status?: TaskStatus) => Task;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  addComment: (taskId: string, message: string) => void;
  deleteProject: (projectId: string) => void;
  updateUserAvatar: (avatarInitials: string) => void;
  addUser: (name: string, role: string) => User;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states or read from localStorage
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('taskflow_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('taskflow_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('taskflow_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('taskflow_comments');
    return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
  });

  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('taskflow_activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('taskflow_currentUser');
    if (saved) return JSON.parse(saved);
    // Default to the first user for high-fidelity direct exploration, or null for forced login.
    // Let's start with u1 (Sarah Johnson) as the pre-logged in user so the preview is rich instantly, 
    // but allow logging out.
    return INITIAL_USERS[0];
  });

  const [searchQuery, setSearchQuery] = useState('');
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'warm'>(() => {
    return (localStorage.getItem('taskflow_theme') as 'light' | 'dark' | 'warm') || 'light';
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('taskflow_notifs');
    return saved ? JSON.parse(saved) : true;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('taskflow_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('taskflow_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskflow_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('taskflow_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('taskflow_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('taskflow_currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('taskflow_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('taskflow_notifs', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  // Auth Operations
  const login = (email: string, password: string): boolean => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (foundUser) {
      setCurrentUser(foundUser);
      // Log login activity
      logAction(foundUser.id, 'logged in', foundUser.name, 'comment');
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) {
      logAction(currentUser.id, 'logged out', currentUser.name, 'comment');
    }
    setCurrentUser(null);
  };

  const updateUserAvatar = (avatarInitials: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, avatar: avatarInitials.toUpperCase().substring(0, 2) };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const addUser = (name: string, role: string): User => {
    const initials = name
      .trim()
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || '??';
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}@company.com`;
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email,
      avatar: initials,
      role: role.trim() || 'Contributor'
    };
    setUsers(prev => [...prev, newUser]);
    if (currentUser) {
      logAction(currentUser.id, 'added team member', name, 'comment');
    }
    return newUser;
  };

  // Activity logger helper
  const logAction = (userId: string, action: string, targetName: string, targetType: 'task' | 'project' | 'comment') => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      action,
      targetName,
      targetType,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50
  };

  // Add Project
  const addProject = (name: string, description: string, members: string[], dueDate: string): Project => {
    const newPrj: Project = {
      id: `p-${Date.now()}`,
      name,
      description,
      progress: 0,
      members,
      dueDate
    };
    setProjects(prev => [...prev, newPrj]);
    
    if (currentUser) {
      logAction(currentUser.id, 'created project', name, 'project');
    }
    return newPrj;
  };

  const deleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    // Also cleanup tasks and projects
    setTasks(prev => prev.filter(t => t.projectId !== projectId));
    
    if (currentUser && project) {
      logAction(currentUser.id, 'deleted project', project.name, 'project');
    }
  };

  // Add Task
  const addTask = (
    title: string,
    description: string,
    projectId: string,
    priority: 'Low' | 'Medium' | 'High',
    assigneeId: string,
    dueDate: string,
    status: TaskStatus = 'To Do'
  ): Task => {
    const newTask: Task = {
      id: `t-${Date.now()}`,
      title,
      description,
      projectId,
      status,
      priority,
      assignee: assigneeId,
      dueDate
    };
    setTasks(prev => [...prev, newTask]);

    if (currentUser) {
      logAction(currentUser.id, 'created task', title, 'task');
    }
    
    updateProjectProgress(projectId);
    return newTask;
  };

  // Update Task
  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    
    if (currentUser) {
      logAction(currentUser.id, 'updated task details for', updatedTask.title, 'task');
    }
    
    updateProjectProgress(updatedTask.projectId);
  };

  // Delete Task
  const deleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    setTasks(prev => prev.filter(t => t.id !== taskId));
    setComments(prev => prev.filter(c => c.taskId !== taskId));

    if (currentUser) {
      logAction(currentUser.id, 'deleted task', taskToDelete.title, 'task');
    }

    updateProjectProgress(taskToDelete.projectId);
  };

  // Move Task (Kanban Column Change)
  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const oldStatus = targetTask.status;
    if (oldStatus === newStatus) return;

    const updated = { ...targetTask, status: newStatus };
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));

    if (currentUser) {
      logAction(currentUser.id, `moved task from ${oldStatus} to ${newStatus}`, targetTask.title, 'task');
    }

    updateProjectProgress(targetTask.projectId);
  };

  // Add Comment
  const addComment = (taskId: string, message: string) => {
    if (!currentUser) return;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      taskId,
      authorId: currentUser.id,
      message,
      createdAt: new Date().toISOString()
    };

    setComments(prev => [...prev, newComment]);

    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask && currentUser) {
      logAction(currentUser.id, 'added comment on', targetTask.title, 'comment');
    }
  };

  // Dynamic project progress computation
  const updateProjectProgress = (projId: string) => {
    // We defer or calculate inside state to avoid async trigger loops.
    // Let's run a calculation right after updating tasks state:
    setTasks(currentTasks => {
      setProjects(currProjects => {
        return currProjects.map(proj => {
          if (proj.id !== projId) return proj;
          
          const projTasks = currentTasks.filter(t => t.projectId === projId);
          if (projTasks.length === 0) return { ...proj, progress: 0 };
          
          const doneTasks = projTasks.filter(t => t.status === 'Done');
          const progressPercentage = Math.round((doneTasks.length / projTasks.length) * 100);
          
          return { ...proj, progress: progressPercentage };
        });
      });
      return currentTasks;
    });
  };

  // Re-calculate all project progress once at startup to keep dynamic lists synced
  useEffect(() => {
    setProjects(currProjects => {
      return currProjects.map(proj => {
        const projTasks = tasks.filter(t => t.projectId === proj.id);
        if (projTasks.length === 0) return { ...proj, progress: 0 };
        const doneTasks = projTasks.filter(t => t.status === 'Done');
        return { ...proj, progress: Math.round((doneTasks.length / projTasks.length) * 100) };
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppContext.Provider value={{
      users,
      projects,
      tasks,
      comments,
      activities,
      currentUser,
      searchQuery,
      theme,
      notificationsEnabled,
      setSearchQuery,
      setTheme,
      setNotificationsEnabled,
      login,
      logout,
      addProject,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      addComment,
      deleteProject,
      updateUserAvatar,
      addUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside an AppContextProvider');
  return context;
};
