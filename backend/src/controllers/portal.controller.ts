import { Request, Response } from 'express';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { calculateLevel, XP_REWARDS } from '../utils/levelSystem';
import { logActivity } from '../utils/logger';

export class PortalController {
  static async getConfig(req: Request, res: Response) {
    const systemConfig = await prisma.systemConfig.findFirst();
    res.json(systemConfig || { 
      maintenanceMode: false, 
      broadcastActive: false, 
      broadcastPriority: 0 
    });
  }

  static async getPublicStats(req: Request, res: Response) {
    const [totalUsers, totalMaterials, totalQuizzes, totalAttempts] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' as any } }),
      prisma.material.count({ where: { isPublished: true } }),
      prisma.quiz.count({ where: { isPublished: true } }),
      prisma.quizAttempt.count(),
    ]);
    res.json({ totalUsers, totalMaterials, totalQuizzes, totalAttempts });
  }

  static async getLeaderboard(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string) || 10;
    const users = await prisma.user.findMany({
      where: { role: 'STUDENT' as any, isActive: true },
      select: {
        id: true, name: true, avatar: true, loginStreak: true, xp: true, level: true, points: true,
        _count: { select: { quizAttempts: true, achievements: true } },
        quizAttempts: { where: { isPassed: true }, select: { percentage: true }, orderBy: { percentage: 'desc' }, take: 1 },
        progress: { where: { isCompleted: true }, select: { id: true } },
      },
      orderBy: { xp: 'desc' }, 
      take: limit,
    });

    const leaderboard = users.map((user, index) => ({
      rank: index + 1, 
      userId: user.id, 
      name: user.name, 
      avatar: user.avatar,
      xp: user.xp, 
      level: user.level,
      streak: user.loginStreak, 
      bestScore: user.quizAttempts[0]?.percentage || 0,
      quizzesCompleted: user._count.quizAttempts, 
      achievements: user._count.achievements,
      materialsCompleted: user.progress.length,
    }));

    res.json(leaderboard);
  }

  static async getProgress(req: Request, res: Response) {
    const progress = await prisma.userProgress.findMany({
      where: { userId: req.user!.userId },
      include: { 
        material: { 
          select: { id: true, title: true, slug: true, difficulty: true, category: true } 
        } 
      },
    });

    const materialsCompleted = progress.filter(p => p.isCompleted).length;
    const quizzesAttempted = await prisma.quizAttempt.count({ where: { userId: req.user!.userId } });
    const totalScore = await prisma.quizAttempt.aggregate({ 
      where: { userId: req.user!.userId }, 
      _sum: { score: true, totalScore: true } 
    });

    res.json({ 
      materialsCompleted, 
      materialsInProgress: progress.length - materialsCompleted, 
      quizzesAttempted, 
      totalScore: totalScore._sum.score || 0, 
      totalPossibleScore: totalScore._sum.totalScore || 0, 
      progress 
    });
  }

  static async updateProgress(req: Request, res: Response) {
    const { materialId } = req.params;
    const { progress, isCompleted } = req.body;

    // Check existing progress first to determine if XP should be awarded
    const existingProgress = await prisma.userProgress.findUnique({
      where: { userId_materialId: { userId: req.user!.userId, materialId } }
    });

    const isNowCompleted = isCompleted || (progress !== undefined && progress >= 100);
    const wasAlreadyCompleted = existingProgress?.isCompleted || false;

    const userProgress = await prisma.userProgress.upsert({
      where: { userId_materialId: { userId: req.user!.userId, materialId } },
      update: { 
        progress: progress !== undefined ? progress : undefined, 
        isCompleted: isNowCompleted, 
        lastReadAt: new Date(), 
        completedAt: isNowCompleted ? (existingProgress?.completedAt || new Date()) : null 
      },
      create: { 
        userId: req.user!.userId, 
        materialId, 
        progress: progress || 0, 
        isCompleted: isNowCompleted, 
        completedAt: isNowCompleted ? new Date() : null 
      },
    });

    // XP Rewards for material completion (Only if just completed and wasn't completed before)
    if (isNowCompleted && !wasAlreadyCompleted) {
      const currentUser = await prisma.user.findUnique({ where: { id: req.user!.userId } });
      if (currentUser) {
        const newXp = currentUser.xp + XP_REWARDS.MATERIAL_READ;
        const newLevel = calculateLevel(newXp);
        await prisma.user.update({
          where: { id: req.user!.userId },
          data: { xp: newXp, level: newLevel, points: { increment: XP_REWARDS.MATERIAL_READ } }
        });
      }
    }

    res.json(userProgress);
  }

  static async search(req: Request, res: Response) {
    let query = (req.query.q as string || '').trim();
    if (!query || query.length < 2) {
      return res.json([]);
    }

    // Search query security hardening
    // 1. Cap query length to prevent Denial of Service (DoS) from massive inputs
    if (query.length > 100) {
      query = query.substring(0, 100);
    }
    // 2. Strip dangerous characters (XSS/injection mitigation)
    query = query.replace(/[\u0000]/g, '').replace(/[<>'"\\]/g, '');

    const [materials, quizzes] = await Promise.all([
      prisma.material.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: { category: true },
        take: 5,
      }),
      prisma.quiz.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: { category: true },
        take: 5,
      }),
    ]);

    const results = [
      ...materials.map(m => ({ 
        id: m.id, title: m.title, slug: m.slug, category: m.category?.name, type: 'material'
      })),
      ...quizzes.map(q => ({ 
        id: q.id, title: q.title, slug: q.slug, category: q.category?.name, type: 'quiz'
      })),
    ];

    // Simple static page search
    const pages = [
      { title: 'Leaderboard Peringkat', path: '/leaderboard', type: 'page' },
      { title: 'Portal Pembelajaran', path: '/portal', type: 'page' },
      { title: 'Perpustakaan Buku', path: '/books', type: 'page' },
    ].filter(p => p.title.toLowerCase().includes(query.toLowerCase()));

    res.json([...results, ...pages]);
  }
}
