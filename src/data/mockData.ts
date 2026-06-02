/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Project, Task, Comment, ActivityLog } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: 'SJ',
    role: 'Project Manager'
  },
  {
    id: 'u2',
    name: 'Michael Chen',
    email: 'michael@example.com',
    avatar: 'MC',
    role: 'Developer'
  },
  {
    id: 'u3',
    name: 'Emma Davis',
    email: 'emma@example.com',
    avatar: 'ED',
    role: 'Designer'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Website Redesign',
    description: 'Company website modernization and branding overhaul.',
    progress: 65,
    members: ['u1', 'u2', 'u3'],
    dueDate: '2026-08-30'
  },
  {
    id: 'p2',
    name: 'Mobile App Launch',
    description: 'Launch new cross-platform mobile application and marketing material preparation.',
    progress: 35,
    members: ['u1', 'u2'],
    dueDate: '2026-10-15'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Create Homepage Wireframes',
    description: 'Design key homepage layouts, focusing on modern typography, clean grid structures, and interactive hero section transitions.',
    projectId: 'p1',
    status: 'In Progress',
    priority: 'High',
    assignee: 'u3',
    dueDate: '2026-07-01'
  },
  {
    id: 't2',
    title: 'Implement Login UI',
    description: 'Build responsive React login screen matching the approved High-fidelity templates. Wire up local states and basic input validation.',
    projectId: 'p1',
    status: 'To Do',
    priority: 'Medium',
    assignee: 'u2',
    dueDate: '2026-07-05'
  },
  {
    id: 't3',
    title: 'Review Design System',
    description: 'Audit current UI components library to align styling, colors, and layout guidelines with Tailwind utility constraints.',
    projectId: 'p1',
    status: 'Done',
    priority: 'Low',
    assignee: 'u1',
    dueDate: '2026-06-20'
  },
  {
    id: 't4',
    title: 'Mobile App Beta Feedback',
    description: 'Collect and categorize feedback from internal testers who are currently running the initial React Native build.',
    projectId: 'p2',
    status: 'To Do',
    priority: 'High',
    assignee: 'u2',
    dueDate: '2026-09-12'
  },
  {
    id: 't5',
    title: 'Draft Store ListingCopy',
    description: 'Write marketing and release description content to prepare the initial iOS App Store and Android Play Store submissions.',
    projectId: 'p2',
    status: 'Review',
    priority: 'Medium',
    assignee: 'u1',
    dueDate: '2026-09-30'
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c1',
    taskId: 't1',
    authorId: 'u1',
    message: 'Please finalize before client review. They need the wireframes next week.',
    createdAt: '2026-06-15T09:00:00Z'
  },
  {
    id: 'c2',
    taskId: 't1',
    authorId: 'u3',
    message: 'Updated wireframes are ready. Added the mobile layout versions too!',
    createdAt: '2026-06-15T11:30:00Z'
  }
];

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'log1',
    userId: 'u1',
    action: 'created project',
    targetName: 'Website Redesign',
    targetType: 'project',
    timestamp: '2026-06-01T08:00:00Z'
  },
  {
    id: 'log2',
    userId: 'u3',
    action: 'submitted comments on',
    targetName: 'Create Homepage Wireframes',
    targetType: 'task',
    timestamp: '2026-06-02T11:30:00Z'
  },
  {
    id: 'log3',
    userId: 'u2',
    action: 'moved task to Done',
    targetName: 'Review Design System',
    targetType: 'task',
    timestamp: '2026-06-02T14:45:00Z'
  }
];
