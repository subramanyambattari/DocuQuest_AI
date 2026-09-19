import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import IORedis from 'ioredis';
import { processPdf } from '../processors/pdf.processor';
import { runExtractionPipeline } from '../services/extraction.service';
import { getFileUrl } from '../services/storage.service';

const prisma = new PrismaClient();
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

export const documentWorker = new Worker(
  'document-processing',
  async (job: Job) => {
    const { documentId } = job.data;
    
    try {
      await prisma.processingJob.create({
        data: {
          documentId,
          bullmqJobId: job.id,
          status: 'PROCESSING',
          currentStage: 'READING_DOCUMENT',
          startedAt: new Date(),
        }
      });

      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'PROCESSING', processingProgress: 10 }
      });

      const document = await prisma.document.findUnique({ where: { id: documentId } });
      if (!document) throw new Error('Document not found');

      const fileUrl = await getFileUrl(document.storageKey);
      
      // We update the DB stage to OCR
      await prisma.processingJob.updateMany({
        where: { bullmqJobId: job.id },
        data: { currentStage: 'OCR', progress: 30 }
      });

      await processPdf(documentId, fileUrl);

      // Run AI Extraction Pipeline
      await prisma.processingJob.updateMany({
        where: { bullmqJobId: job.id },
        data: { currentStage: 'AI_EXTRACTION', progress: 60 }
      });

      await runExtractionPipeline(documentId);

      // Successfully processed
      await prisma.processingJob.updateMany({
        where: { bullmqJobId: job.id },
        data: { status: 'COMPLETED', currentStage: 'COMPLETED', progress: 100, completedAt: new Date() }
      });

      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'COMPLETED', processingProgress: 100 }
      });

    } catch (err: any) {
      console.error(`Error processing document ${documentId}:`, err);
      
      await prisma.processingJob.updateMany({
        where: { bullmqJobId: job.id },
        data: { status: 'FAILED', errorMessage: err.message, completedAt: new Date() }
      });

      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'FAILED', errorMessage: err.message }
      });
      throw err;
    }
  },
  { connection }
);

documentWorker.on('ready', () => {
  console.log('Document processing worker is ready');
});
