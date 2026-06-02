import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing database
  await prisma.activityLog.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Users
  const passwordHash = await bcrypt.hash('password', 10);

  const u1 = await prisma.user.create({
    data: {
      id: 'u1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar: 'SJ',
      role: 'Project Manager',
      passwordHash,
    },
  });

  const u2 = await prisma.user.create({
    data: {
      id: 'u2',
      name: 'Michael Chen',
      email: 'michael@example.com',
      avatar: 'MC',
      role: 'Developer',
      passwordHash,
    },
  });

  const u3 = await prisma.user.create({
    data: {
      id: 'u3',
      name: 'Emma Davis',
      email: 'emma@example.com',
      avatar: 'ED',
      role: 'Designer',
      passwordHash,
    },
  });

  console.log('Users created.');

  // 2. Create Projects
  const p1 = await prisma.project.create({
    data: {
      id: 'p1',
      name: 'Website Redesign',
      description: 'Company website modernization and branding overhaul.',
      dueDate: new Date('2026-08-30'),
    },
  });

  const p2 = await prisma.project.create({
    data: {
      id: 'p2',
      name: 'Mobile App Launch',
      description: 'Launch new cross-platform mobile application and marketing material preparation.',
      dueDate: new Date('2026-10-15'),
    },
  });

  console.log('Projects created.');

  // 3. Create Project Members
  await prisma.projectMember.createMany({
    data: [
      { projectId: 'p1', userId: 'u1' },
      { projectId: 'p1', userId: 'u2' },
      { projectId: 'p1', userId: 'u3' },
      { projectId: 'p2', userId: 'u1' },
      { projectId: 'p2', userId: 'u2' },
    ],
  });

  console.log('Project members assigned.');

  // 4. Create Tasks
  await prisma.task.create({
    data: {
      id: 't1',
      title: 'Create Homepage Wireframes',
      description: 'Design key homepage layouts, focusing on modern typography, clean grid structures, and interactive hero section transitions.',
      projectId: 'p1',
      status: 'In Progress',
      priority: 'High',
      assigneeId: 'u3',
      dueDate: new Date('2026-07-01'),
      percentage: 65,
    },
  });

  await prisma.task.create({
    data: {
      id: 't2',
      title: 'Implement Login UI',
      description: 'Build responsive React login screen matching the approved High-fidelity templates. Wire up local states and basic input validation.',
      projectId: 'p1',
      status: 'To Do',
      priority: 'Medium',
      assigneeId: 'u2',
      dueDate: new Date('2026-07-05'),
      percentage: 0,
    },
  });

  await prisma.task.create({
    data: {
      id: 't3',
      title: 'Review Design System',
      description: 'Audit current UI components library to align styling, colors, and layout guidelines with Tailwind utility constraints.',
      projectId: 'p1',
      status: 'Done',
      priority: 'Low',
      assigneeId: 'u1',
      dueDate: new Date('2026-06-20'),
      percentage: 100,
    },
  });

  await prisma.task.create({
    data: {
      id: 't4',
      title: 'Mobile App Beta Feedback',
      description: 'Collect and categorize feedback from internal testers who are currently running the initial React Native build.',
      projectId: 'p2',
      status: 'To Do',
      priority: 'High',
      assigneeId: 'u2',
      dueDate: new Date('2026-09-12'),
      percentage: 0,
    },
  });

  await prisma.task.create({
    data: {
      id: 't5',
      title: 'Draft Store ListingCopy',
      description: 'Write marketing and release description content to prepare the initial iOS App Store and Android Play Store submissions.',
      projectId: 'p2',
      status: 'Review',
      priority: 'Medium',
      assigneeId: 'u1',
      dueDate: new Date('2026-09-30'),
      percentage: 40,
    },
  });

  console.log('Tasks created.');

  // 5. Create Comments
  await prisma.comment.createMany({
    data: [
      {
        id: 'c1',
        taskId: 't1',
        authorId: 'u1',
        message: 'Please finalize before client review. They need the wireframes next week.',
        createdAt: new Date('2026-06-15T09:00:00Z'),
      },
      {
        id: 'c2',
        taskId: 't1',
        authorId: 'u3',
        message: 'Updated wireframes are ready. Added the mobile layout versions too!',
        createdAt: new Date('2026-06-15T11:30:00Z'),
      },
    ],
  });

  console.log('Comments created.');

  // 6. Create Activities
  await prisma.activityLog.createMany({
    data: [
      {
        id: 'log1',
        userId: 'u1',
        action: 'created project',
        targetName: 'Website Redesign',
        targetType: 'project',
        timestamp: new Date('2026-06-01T08:00:00Z'),
      },
      {
        id: 'log2',
        userId: 'u3',
        action: 'submitted comments on',
        targetName: 'Create Homepage Wireframes',
        targetType: 'task',
        timestamp: new Date('2026-06-02T11:30:00Z'),
      },
      {
        id: 'log3',
        userId: 'u2',
        action: 'moved task to Done',
        targetName: 'Review Design System',
        targetType: 'task',
        timestamp: new Date('2026-06-02T14:45:00Z'),
      },
    ],
  });

  console.log('Activity logs created.');
  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
