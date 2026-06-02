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

const API_BASE = 'http://localhost:5000/api';

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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, role: string, password: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
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
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);

  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]);
  const [token, setToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'warm'>(() => {
    return (localStorage.getItem('taskflow_theme') as 'light' | 'dark' | 'warm') || 'light';
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('taskflow_notifs');
    return saved ? JSON.parse(saved) : true;
  });

  // Sync basic configurations to localStorage
  useEffect(() => {
    localStorage.setItem('taskflow_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('taskflow_notifs', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const currentToken = token || localStorage.getItem('taskflow_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {}),
      ...options.headers,
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 || res.status === 403) {
      logout();
      throw new Error('Unauthorized');
    }
    return res;
  };

  const loadAllData = async (currentToken: string | null) => {
    if (!currentToken) return;
    try {
      const headers = {
        'Authorization': `Bearer ${currentToken}`,
      };

      const [usersRes, projectsRes, tasksRes, activitiesRes] = await Promise.all([
        fetch(`${API_BASE}/users`, { headers }),
        fetch(`${API_BASE}/projects`, { headers }),
        fetch(`${API_BASE}/tasks`, { headers }),
        fetch(`${API_BASE}/activities`, { headers }),
      ]);

      if (usersRes.status === 401 || projectsRes.status === 401 || tasksRes.status === 401 || activitiesRes.status === 401) {
        logout();
        return;
      }

      const [usersData, projectsData, tasksData, activitiesData] = await Promise.all([
        usersRes.json(),
        projectsRes.json(),
        tasksRes.json(),
        activitiesRes.json(),
      ]);

      setUsers(usersData);
      setProjects(projectsData);
      setTasks(tasksData);
      setActivities(activitiesData);

      // Fetch comments for all tasks
      const allComments: Comment[] = [];
      await Promise.all(tasksData.map(async (t: Task) => {
        try {
          const commentsRes = await fetch(`${API_BASE}/tasks/${t.id}/comments`, { headers });
          if (commentsRes.ok) {
            const commentsData = await commentsRes.json();
            allComments.push(...commentsData);
          }
        } catch (e) {
          console.error(`Failed to fetch comments for task ${t.id}`, e);
        }
      }));
      setComments(allComments);
    } catch (err) {
      console.error('loadAllData error:', err);
    }
  };

  // Auth check and load on mount
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const savedToken = localStorage.getItem('taskflow_token');
      if (savedToken) {
        setToken(savedToken);
        try {
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${savedToken}` },
          });
          if (res.ok) {
            const userData = await res.json();
            setCurrentUser(userData);
            localStorage.setItem('taskflow_currentUser', JSON.stringify(userData));
            await loadAllData(savedToken);
          } else {
            logout();
          }
        } catch (e) {
          console.error('Init auth check failed:', e);
          const savedUser = localStorage.getItem('taskflow_currentUser');
          if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
            loadAllData(savedToken);
          } else {
            logout();
          }
        }
      }
    };
    checkAuthAndLoad();
  }, []);

  // Auth Operations
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('taskflow_token', data.token);
      setCurrentUser(data.user);
      localStorage.setItem('taskflow_currentUser', JSON.stringify(data.user));
      await loadAllData(data.token);
      return true;
    } catch (e) {
      console.error('Login error:', e);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('taskflow_token');
    setCurrentUser(null);
    localStorage.removeItem('taskflow_currentUser');
    setProjects([]);
    setTasks([]);
    setComments([]);
    setActivities([]);
  };

  const register = async (name: string, email: string, role: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('taskflow_token', data.token);
      setCurrentUser(data.user);
      localStorage.setItem('taskflow_currentUser', JSON.stringify(data.user));
      await loadAllData(data.token);
      return true;
    } catch (e) {
      console.error('Register error:', e);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/users/password`, {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to change password' };
      }
      return { success: true };
    } catch (e: any) {
      console.error('changePassword error:', e);
      return { success: false, error: e.message || 'Connection error' };
    }
  };

  const updateUserAvatar = (avatarInitials: string) => {
    if (!currentUser) return;
    const originalAvatar = currentUser.avatar;
    const updatedUser = { ...currentUser, avatar: avatarInitials.toUpperCase().substring(0, 2) };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

    fetchWithAuth(`${API_BASE}/users/avatar`, {
      method: 'PATCH',
      body: JSON.stringify({ avatar: avatarInitials }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update avatar');
        return res.json();
      })
      .then((savedUser: User) => {
        setCurrentUser(savedUser);
        localStorage.setItem('taskflow_currentUser', JSON.stringify(savedUser));
        setUsers(prev => prev.map(u => u.id === savedUser.id ? savedUser : u));
      })
      .catch(err => {
        console.error(err);
        setCurrentUser({ ...currentUser, avatar: originalAvatar });
        setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...currentUser, avatar: originalAvatar } : u));
      });
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
    const tempId = `usr-${Date.now()}`;
    const newUser: User = {
      id: tempId,
      name: name.trim(),
      email,
      avatar: initials,
      role: role.trim() || 'Contributor'
    };
    setUsers(prev => [...prev, newUser]);

    fetchWithAuth(`${API_BASE}/users`, {
      method: 'POST',
      body: JSON.stringify({ name, role }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create user');
        return res.json();
      })
      .then((createdUser: User) => {
        setUsers(prev => prev.map(u => u.id === tempId ? createdUser : u));
        fetchWithAuth(`${API_BASE}/activities`).then(r => r.json()).then(setActivities);
      })
      .catch(err => {
        console.error(err);
        setUsers(prev => prev.filter(u => u.id !== tempId));
      });

    return newUser;
  };

  // Add Project
  const addProject = (name: string, description: string, members: string[], dueDate: string): Project => {
    const tempId = `p-${Date.now()}`;
    const newPrj: Project = {
      id: tempId,
      name,
      description,
      progress: 0,
      members,
      dueDate
    };
    setProjects(prev => [...prev, newPrj]);

    fetchWithAuth(`${API_BASE}/projects`, {
      method: 'POST',
      body: JSON.stringify({ name, description, members, dueDate }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create project');
        return res.json();
      })
      .then((createdProject: Project) => {
        setProjects(prev => prev.map(p => p.id === tempId ? createdProject : p));
        fetchWithAuth(`${API_BASE}/activities`).then(r => r.json()).then(setActivities);
      })
      .catch(err => {
        console.error(err);
        setProjects(prev => prev.filter(p => p.id !== tempId));
      });

    return newPrj;
  };

  const deleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setTasks(prev => prev.filter(t => t.projectId !== projectId));

    fetchWithAuth(`${API_BASE}/projects/${projectId}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete project');
        fetchWithAuth(`${API_BASE}/activities`).then(r => r.json()).then(setActivities);
      })
      .catch(err => {
        console.error(err);
        loadAllData(token);
      });
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
    const tempId = `t-${Date.now()}`;
    const newTask: Task = {
      id: tempId,
      title,
      description,
      projectId,
      status,
      priority,
      assignee: assigneeId,
      dueDate
    };
    setTasks(prev => [...prev, newTask]);

    fetchWithAuth(`${API_BASE}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ title, description, projectId, assignee: assigneeId, priority, status, dueDate }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to add task');
        return res.json();
      })
      .then((createdTask: Task) => {
        setTasks(prev => prev.map(t => t.id === tempId ? createdTask : t));
        updateProjectProgress(projectId);
        fetchWithAuth(`${API_BASE}/activities`).then(r => r.json()).then(setActivities);
      })
      .catch(err => {
        console.error(err);
        setTasks(prev => prev.filter(t => t.id !== tempId));
      });

    return newTask;
  };

  // Update Task
  const updateTask = (updatedTask: Task) => {
    const originalTask = tasks.find(t => t.id === updatedTask.id);
    if (!originalTask) return;

    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

    fetchWithAuth(`${API_BASE}/tasks/${updatedTask.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        priority: updatedTask.priority,
        assignee: updatedTask.assignee,
        dueDate: updatedTask.dueDate,
        percentage: updatedTask.percentage,
        imageUrl: updatedTask.imageUrl
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update task');
        return res.json();
      })
      .then((savedTask: Task) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? savedTask : t));
        updateProjectProgress(updatedTask.projectId);
        fetchWithAuth(`${API_BASE}/activities`).then(r => r.json()).then(setActivities);
      })
      .catch(err => {
        console.error(err);
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? originalTask : t));
      });
  };

  // Delete Task
  const deleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    setTasks(prev => prev.filter(t => t.id !== taskId));
    setComments(prev => prev.filter(c => c.taskId !== taskId));

    fetchWithAuth(`${API_BASE}/tasks/${taskId}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete task');
        updateProjectProgress(taskToDelete.projectId);
        fetchWithAuth(`${API_BASE}/activities`).then(r => r.json()).then(setActivities);
      })
      .catch(err => {
        console.error(err);
        loadAllData(token);
      });
  };

  // Move Task (Kanban Column Change)
  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const oldStatus = targetTask.status;
    if (oldStatus === newStatus) return;

    const updated = { ...targetTask, status: newStatus };
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));

    fetchWithAuth(`${API_BASE}/tasks/${taskId}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to move task');
        return res.json();
      })
      .then((savedTask: Task) => {
        setTasks(prev => prev.map(t => t.id === taskId ? savedTask : t));
        updateProjectProgress(targetTask.projectId);
        fetchWithAuth(`${API_BASE}/activities`).then(r => r.json()).then(setActivities);
      })
      .catch(err => {
        console.error(err);
        setTasks(prev => prev.map(t => t.id === taskId ? targetTask : t));
      });
  };

  // Add Comment
  const addComment = (taskId: string, message: string) => {
    if (!currentUser) return;

    const tempId = `c-${Date.now()}`;
    const newComment: Comment = {
      id: tempId,
      taskId,
      authorId: currentUser.id,
      message,
      createdAt: new Date().toISOString()
    };

    setComments(prev => [...prev, newComment]);

    fetchWithAuth(`${API_BASE}/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to add comment');
        return res.json();
      })
      .then((createdComment: Comment) => {
        setComments(prev => prev.map(c => c.id === tempId ? createdComment : c));
        fetchWithAuth(`${API_BASE}/activities`).then(r => r.json()).then(setActivities);
      })
      .catch(err => {
        console.error(err);
        setComments(prev => prev.filter(c => c.id !== tempId));
      });
  };

  // Dynamic project progress computation
  const updateProjectProgress = (projId: string) => {
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
      register,
      changePassword,
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
