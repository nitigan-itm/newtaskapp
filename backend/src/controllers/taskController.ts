import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';

const formatTask = (t: any) => ({
  id: t.id,
  title: t.title,
  description: t.description || '',
  projectId: t.projectId,
  status: t.status,
  priority: t.priority,
  assignee: t.assigneeId,
  dueDate: t.dueDate.toISOString().split('T')[0],
  percentage: t.percentage,
  imageUrl: t.imageUrl || undefined,
});

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, assigneeId, status, priority } = req.query;

    const where: any = {};
    if (projectId) where.projectId = projectId as string;
    if (assigneeId) where.assigneeId = assigneeId as string;
    if (status) where.status = status as string;
    if (priority) where.priority = priority as string;

    const tasks = await prisma.task.findMany({ where });
    return res.json(tasks.map(formatTask));
  } catch (error) {
    console.error('getTasks error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, projectId, assignee, priority, status, dueDate } = req.body;

    if (!title || !projectId || !assignee || !dueDate) {
      return res.status(400).json({ error: 'Title, Project ID, Assignee, and Due Date are required.' });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || '',
        projectId,
        assigneeId: assignee,
        priority: priority || 'Medium',
        status: status || 'To Do',
        dueDate: new Date(dueDate),
        percentage: 0,
      },
    });

    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'created task',
          targetName: title,
          targetType: 'task',
        },
      });
    }

    return res.status(201).json(formatTask(newTask));
  } catch (error) {
    console.error('createTask error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignee, dueDate, percentage, imageUrl } = req.body;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Determine activity details
    let logAction = '';
    let logTargetName = existingTask.title;

    if (status && status !== existingTask.status) {
      logAction = `moved task from ${existingTask.status} to ${status}`;
    } else if (title && title !== existingTask.title) {
      logAction = 'updated task details for';
      logTargetName = title;
    } else if (description !== undefined && description !== existingTask.description) {
      logAction = 'updated task details for';
    }

    const updatedData: any = {};
    if (title !== undefined) updatedData.title = title;
    if (description !== undefined) updatedData.description = description;
    if (status !== undefined) updatedData.status = status;
    if (priority !== undefined) updatedData.priority = priority;
    if (assignee !== undefined) updatedData.assigneeId = assignee;
    if (dueDate !== undefined) updatedData.dueDate = new Date(dueDate);
    if (percentage !== undefined) updatedData.percentage = percentage;
    if (imageUrl !== undefined) updatedData.imageUrl = imageUrl;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updatedData,
    });

    if (req.user && logAction) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: logAction,
          targetName: logTargetName,
          targetType: 'task',
        },
      });
    }

    return res.json(formatTask(updatedTask));
  } catch (error) {
    console.error('updateTask error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({ where: { id } });

    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'deleted task',
          targetName: task.title,
          targetType: 'task',
        },
      });
    }

    return res.json({ success: true, message: `Task ${task.title} deleted successfully.` });
  } catch (error) {
    console.error('deleteTask error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const moveTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const oldStatus = existingTask.status;
    if (oldStatus === status) {
      return res.json(formatTask(existingTask));
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
    });

    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: `moved task from ${oldStatus} to ${status}`,
          targetName: existingTask.title,
          targetType: 'task',
        },
      });
    }

    return res.json(formatTask(updatedTask));
  } catch (error) {
    console.error('moveTask error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
