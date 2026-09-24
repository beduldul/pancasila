import { Request, Response } from 'express';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { filterProfanity } from '../utils/profanityFilter';
import { logActivity } from '../utils/logger';

export class DiscussionController {
  static async createComment(req: Request, res: Response) {
    const { content, materialId, quizId, parentId } = req.body;
    
    // Terapkan Penyaring Konten
    const filteredContent = filterProfanity(content);

    const comment = await prisma.comment.create({
      data: { 
        content: filteredContent, 
        userId: req.user!.userId, 
        materialId, 
        quizId, 
        parentId 
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    await logActivity(req.user!.userId, 'CREATE_COMMENT', 'comment', comment.id, `Komentar pada ${materialId ? 'materi' : 'kuis'}`, req);
    res.status(201).json(comment);
  }

  static async submitFeedback(req: Request, res: Response) {
    const { content, category } = req.body;
    const filteredContent = filterProfanity(content);
    
    const feedback = await prisma.feedback.create({
      data: { 
        content: filteredContent, 
        category: category || 'GENERAL', 
        userId: req.user!.userId 
      },
    });

    await logActivity(req.user!.userId, 'SUBMIT_FEEDBACK', 'feedback', feedback.id, `Kategori: ${category}`, req);
    res.status(201).json(feedback);
  }

  static async deleteComment(req: Request, res: Response) {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new AppError(404, 'Komentar tidak ditemukan');
    }

    // Comment deletion ownership & moderation validation
    const isStaff = req.user!.role === 'ADMIN' || req.user!.role === 'TUTOR';
    const isOwner = comment.userId === req.user!.userId;
    if (!isOwner && !isStaff) {
      throw new AppError(403, 'Akses ditolak: Anda tidak memiliki wewenang untuk menghapus komentar ini.');
    }

    // Delete replies first if any (to handle foreign key constraint)
    await prisma.comment.deleteMany({
      where: { parentId: id },
    });

    await prisma.comment.delete({
      where: { id },
    });

    await logActivity(req.user!.userId, 'DELETE_COMMENT', 'comment', id, `Menghapus komentar: ${comment.content.substring(0, 50)}...`, req);
    res.json({ message: 'Komentar berhasil dihapus' });
  }
}
