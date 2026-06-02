import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import prisma from '../config/database';
import { AuthRequest } from '../types';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
      },
    });
    return res.json(users);
  } catch (error) {
    console.error('getUsers error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, role } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const initials = name
      .trim()
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || '??';
    
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}@company.com`;
    // Create new user with a default seed password
    const dummyPasswordHash = '$2b$10$dummyHashPlaceholderForBcryptPasswordHashing'; // placeholder hash

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email,
        avatar: initials,
        role: role || 'Contributor',
        passwordHash: dummyPasswordHash,
      },
    });

    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'added team member',
          targetName: name,
          targetType: 'comment',
        },
      });
    }

    return res.status(201).json(newUser);
  } catch (error) {
    console.error('createUser error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { avatar } = req.body;

    if (!avatar || avatar.length > 2) {
      return res.status(400).json({ error: 'Avatar must be 1-2 initials characters' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: avatar.toUpperCase() },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
      },
    });

    return res.json(updatedUser);
  } catch (error) {
    console.error('updateAvatar error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUsersProgress = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        assignedTasks: true,
      },
    });

    const progressList = users.map((user) => {
      const uTasks = user.assignedTasks;
      const total = uTasks.length;
      const completed = uTasks.filter(t => t.status === 'Done').length;
      const inProgress = uTasks.filter(t => t.status === 'In Progress').length;
      const review = uTasks.filter(t => t.status === 'Review').length;
      const todo = uTasks.filter(t => t.status === 'To Do').length;
      const backlog = uTasks.filter(t => t.status === 'Backlog').length;

      const totalPercentage = uTasks.reduce((acc, t) => acc + (t.percentage ?? (t.status === 'Done' ? 100 : 0)), 0);
      const averagePercent = total > 0 ? Math.round(totalPercentage / total) : 0;

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
        total,
        completed,
        inProgress,
        review,
        todo,
        backlog,
        averagePercent,
        tasksList: uTasks.map(t => ({
          id: t.id,
          title: t.title,
          projectId: t.projectId,
          status: t.status,
          priority: t.priority,
          percentage: t.percentage,
          dueDate: t.dueDate.toISOString().split('T')[0],
        })),
      };
    });

    // Sort by highest average completion percentage
    progressList.sort((a, b) => b.averagePercent - a.averagePercent);

    return res.json(progressList);
  } catch (error) {
    console.error('getUsersProgress error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash },
    });

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('changePassword error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
