import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';

export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const comments = await prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });

    const formattedComments = comments.map(c => ({
      id: c.id,
      taskId: c.taskId,
      authorId: c.authorId,
      message: c.message,
      createdAt: c.createdAt.toISOString(),
    }));

    return res.json(formattedComments);
  } catch (error) {
    console.error('getComments error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { message } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Comment message is required' });
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const newComment = await prisma.comment.create({
      data: {
        taskId,
        authorId: req.user.id,
        message: message.trim(),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'added comment on',
        targetName: task.title,
        targetType: 'comment',
      },
    });

    return res.status(201).json({
      id: newComment.id,
      taskId: newComment.taskId,
      authorId: newComment.authorId,
      message: newComment.message,
      createdAt: newComment.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('createComment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getActivities = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    const formattedLogs = logs.map(log => ({
      id: log.id,
      userId: log.userId,
      action: log.action,
      targetName: log.targetName,
      targetType: log.targetType,
      timestamp: log.timestamp.toISOString(),
    }));

    return res.json(formattedLogs);
  } catch (error) {
    console.error('getActivities error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
