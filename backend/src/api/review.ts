import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

router.get('/document/:documentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;

    const items = await prisma.reviewItem.findMany({
      where: { documentId, status: 'PENDING' },
      include: {
        question: {
          include: { options: true }
        }
      }
    });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch review items' } });
  }
});

router.post('/:id/resolve', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { resolutionAction, updatedQuestionText } = req.body;

    const item = await prisma.reviewItem.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Review item not found' } });
    }

    if (resolutionAction === 'APPROVE_AS_IS' || resolutionAction === 'EDITED') {
      if (resolutionAction === 'EDITED' && updatedQuestionText && item.questionId) {
        await prisma.question.update({
          where: { id: item.questionId },
          data: { questionText: updatedQuestionText, status: 'REVIEWED' }
        });
      } else if (item.questionId) {
        await prisma.question.update({
          where: { id: item.questionId },
          data: { status: 'REVIEWED' }
        });
      }
      
      const updatedItem = await prisma.reviewItem.update({
        where: { id },
        data: { status: 'RESOLVED', resolvedAt: new Date() }
      });
      return res.json(updatedItem);
    }

    res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Invalid action' } });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to resolve item' } });
  }
});

export default router;
