const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

process.on('exit', (code) => {
  console.log(`DEBUG: Process exiting with code: ${code}`);
});

process.on('SIGINT', () => {
  console.log('DEBUG: Received SIGINT');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('DEBUG: Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'JUNIOR',
        status: 'PENDING' // Requires Admin approval
      }
    });

    res.status(201).json({ message: 'Registration successful. Awaiting admin approval.', user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.status !== 'APPROVED') {
      return res.status(403).json({ message: 'Account pending approval or rejected' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        image: user.image
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- USER ROUTES ---

// Get All Users (Admin only)
app.get('/api/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'MD') return res.status(403).json({ message: 'Access denied' });

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

app.patch('/api/users/me', authenticateToken, async (req, res) => {
  const { name, email, image } = req.body;
  const userId = req.user.id;

  console.log('DEBUG: PATCH /api/users/me', { userId, name, email, imageSize: image?.length });

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email, image }
    });
    console.log('DEBUG: Update success');
    res.json(updatedUser);
  } catch (error) {
    console.error('DEBUG: Prisma error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Update User Details (Admin only)
app.patch('/api/users/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'MD') return res.status(403).json({ message: 'Access denied' });

  const { name, email, role, departmentId, image } = req.body;
  const { id } = req.params;

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email, role, departmentId, image }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Update User Status (Admin only)
app.patch('/api/users/:id/status', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'MD') return res.status(403).json({ message: 'Access denied' });

  const { status, resignationReason } = req.body;
  const { id } = req.params;

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { 
        status,
        ...(resignationReason && { resignationReason })
      }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status' });
  }
});

// Get Current User Profile
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { department: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// --- TASK ROUTES ---

// Get All Tasks
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: { assignedTo: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Create Task (Seniors/Admin/MD)
app.post('/api/tasks', authenticateToken, async (req, res) => {
  if (req.user.role === 'JUNIOR') return res.status(403).json({ message: 'Access denied' });

  const { title, description, assignedToId, priority, points, deadline } = req.body;

  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        assignedToId,
        assignedById: req.user.id,
        priority,
        points,
        deadline: new Date(deadline),
        status: 'PENDING'
      }
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

app.get('/api/tasks/my', authenticateToken, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { assignedToId: req.user.id },
      include: { assignedTo: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// Update Task Status & Points
app.patch('/api/tasks/:id/status', authenticateToken, async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Only assigned user or creator can update
    if (task.assignedToId !== req.user.id && task.assignedById !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status }
    });

    // If completed, award points
    if (status === 'COMPLETED' && task.status !== 'COMPLETED') {
      await prisma.user.update({
        where: { id: task.assignedToId },
        data: { points: { increment: task.points } }
      });

      await prisma.performanceLog.create({
        data: {
          userId: task.assignedToId,
          taskId: task.id,
          points: task.points,
          reason: `Completed task: ${task.title}`
        }
      });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

// --- FEEDBACK ROUTES ---

app.post('/api/feedback', authenticateToken, async (req, res) => {
  const { taskId, rating, comment } = req.body;
  try {
    const feedback = await prisma.feedback.create({
      data: {
        userId: req.user.id,
        taskId,
        rating,
        comment
      }
    });
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting feedback' });
  }
});

app.get('/api/feedback', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'MD') return res.status(403).json({ message: 'Access denied' });

  try {
    const feedbacks = await prisma.feedback.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { timestamp: 'desc' }
    });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback' });
  }
});

// --- ANALYTICS ---

app.get('/api/stats/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const isGlobalManager = req.user.role === 'ADMIN' || req.user.role === 'MD';

    // 1. Task Counts
    const taskCounts = await prisma.task.groupBy({
      by: ['status'],
      where: isGlobalManager ? {} : { assignedToId: userId },
      _count: true
    });

    const stats = {
      completed: taskCounts.find(t => t.status === 'COMPLETED')?._count || 0,
      pending: taskCounts.find(t => t.status === 'PENDING')?._count || 0,
      inProgress: taskCounts.find(t => t.status === 'IN_PROGRESS')?._count || 0,
    };

    // 2. Productivity Trends (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const logs = await prisma.performanceLog.findMany({
      where: {
        userId: isGlobalManager ? undefined : userId,
        timestamp: { gte: sevenDaysAgo }
      },
      orderBy: { timestamp: 'asc' }
    });

    // Group logs by day (Last 7 days)
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayPoints = logs
        .filter(log => {
          const logDate = new Date(log.timestamp);
          logDate.setHours(0, 0, 0, 0);
          return logDate.getTime() === d.getTime();
        })
        .reduce((sum, log) => sum + log.points, 0);
        
      trendData.push({ name: dayLabel, points: dayPoints });
    }

    // 3. Recent Tasks
    const recentTasks = await prisma.task.findMany({
      where: isGlobalManager ? {} : { assignedToId: userId },
      include: { assignedTo: { select: { name: true, image: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    const responseBody = {
      taskStats: stats,
      trends: trendData,
      recentTasks,
      efficiency: stats.completed > 0 ? Math.round((stats.completed / (stats.completed + stats.pending)) * 100) : 0
    };

    res.json(responseBody);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const topUsers = await prisma.user.findMany({
      where: { 
        status: 'APPROVED',
        role: { notIn: ['ADMIN', 'MD'] }
      },
      orderBy: { points: 'desc' },
      take: 10,
      select: { 
        id: true,
        name: true, 
        points: true, 
        role: true, 
        image: true,
        department: { select: { name: true } } 
      }
    });
    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Keep process alive
setInterval(() => {}, 1000);
