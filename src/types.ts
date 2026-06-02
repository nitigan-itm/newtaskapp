/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string; // URL or color-coded initials
  role: string;
}

export type TaskStatus = 'Backlog' | 'To Do' | 'In Progress' | 'Review' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number; // dynamically computed or manual
  members: string[]; // User IDs
  dueDate: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string; // User ID
  dueDate: string;
  comments?: number; // legacy from PRD, but we will count comments array length dynamically or store
  percentage?: number; // percentage of completion (0 to 100)
  imageUrl?: string;   // Image URL or Base64 uploaded image string
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  message: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;      // e.g., "created task", "moved task to Done"
  targetName: string;  // e.g., task or project title
  targetType: 'task' | 'project' | 'comment';
  timestamp: string;
}
