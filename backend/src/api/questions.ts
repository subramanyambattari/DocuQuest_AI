import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

router.get('/document/:documentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;

    // Verify document belongs to user
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId: req.user!.id }
    });

    if (!document) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }

    const questions = await prisma.question.findMany({
      where: { documentId },
      include: {
        options: true,
        answers: true
      },
      orderBy: { startPage: 'asc' }
    });

    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch questions' } });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { questionText, status } = req.body;

    const question = await prisma.question.update({
      where: { id },
      data: { questionText, status }
    });

    res.json(question);
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update question' } });
  }
});

export default router;
