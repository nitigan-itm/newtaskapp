import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        members: {
          select: {
            userId: true,
          },
        },
        tasks: {
          select: {
            status: true,
          },
        },
      },
    });

    const formattedProjects = projects.map((p) => {
      const projTasks = p.tasks;
      let progress = 0;
      if (projTasks.length > 0) {
        const doneTasks = projTasks.filter(t => t.status === 'Done').length;
        progress = Math.round((doneTasks / projTasks.length) * 100);
      }

      return {
        id: p.id,
        name: p.name,
        description: p.description || '',
        progress,
        dueDate: p.dueDate.toISOString().split('T')[0],
        members: p.members.map(m => m.userId),
      };
    });

    return res.json(formattedProjects);
  } catch (error) {
    console.error('getProjects error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            userId: true,
          },
        },
        tasks: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projTasks = project.tasks;
    let progress = 0;
    if (projTasks.length > 0) {
      const doneTasks = projTasks.filter(t => t.status === 'Done').length;
      progress = Math.round((doneTasks / projTasks.length) * 100);
    }

    const formattedProject = {
      id: project.id,
      name: project.name,
      description: project.description || '',
      progress,
      dueDate: project.dueDate.toISOString().split('T')[0],
      members: project.members.map(m => m.userId),
    };

    return res.json(formattedProject);
  } catch (error) {
    console.error('getProjectById error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, members, dueDate } = req.body;
    if (!name || !dueDate) {
      return res.status(400).json({ error: 'Project Name and Due Date are required.' });
    }

    const newPrj = await prisma.project.create({
      data: {
        name,
        description: description || '',
        dueDate: new Date(dueDate),
      },
    });

    // Assign project members
    if (members && Array.isArray(members) && members.length > 0) {
      await prisma.projectMember.createMany({
        data: members.map((userId: string) => ({
          projectId: newPrj.id,
          userId,
        })),
      });
    }

    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'created project',
          targetName: name,
          targetType: 'project',
        },
      });
    }

    return res.status(201).json({
      id: newPrj.id,
      name: newPrj.name,
      description: newPrj.description || '',
      progress: 0,
      dueDate: newPrj.dueDate.toISOString().split('T')[0],
      members: members || [],
    });
  } catch (error) {
    console.error('createProject error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await prisma.project.delete({ where: { id } });

    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'deleted project',
          targetName: project.name,
          targetType: 'project',
        },
      });
    }

    return res.json({ success: true, message: `Project ${project.name} deleted successfully.` });
  } catch (error) {
    console.error('deleteProject error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const addProjectMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    await prisma.projectMember.create({
      data: {
        projectId: id,
        userId,
      },
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('addProjectMember error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeProjectMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id, userId } = req.params;

    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId: id,
          userId,
        },
      },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('removeProjectMember error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
