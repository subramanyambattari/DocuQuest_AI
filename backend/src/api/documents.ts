import { Router, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middlewares/auth.middleware';
import { uploadFile } from '../services/storage.service';

const router = Router();
const prisma = new PrismaClient();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '50') * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, JPEG, and PNG are allowed.'));
    }
  }
});

router.post('/', authenticateToken, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: { code: 'NO_FILE', message: 'No file provided' } });
    }

    const fileExt = file.originalname.split('.').pop();
    const storageKey = `${uuidv4()}.${fileExt}`;

    // Upload to MinIO
    await uploadFile(storageKey, file.buffer, file.mimetype);

    // Save to Database
    const document = await prisma.document.create({
      data: {
        userId: req.user!.id,
        filename: file.originalname,
        originalFilename: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        storageKey,
        status: 'QUEUED',
      }
    });

    // TODO: Enqueue BullMQ task here for async processing

    res.status(202).json({
      id: document.id,
      filename: document.filename,
      status: document.status
    });
  } catch (err: any) {
    if (err.message.includes('Invalid file type')) {
      return res.status(400).json({ error: { code: 'UNSUPPORTED_FILE_TYPE', message: err.message } });
    }
    console.error('Upload error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to upload document' } });
  }
});

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(documents);
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch documents' } });
  }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.user!.id }
    });

    if (!document) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }

    res.json(document);
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch document' } });
  }
});

export default router;
