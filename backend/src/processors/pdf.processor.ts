import { PrismaClient } from '@prisma/client';
import pdf from 'pdf-parse';
import Tesseract from 'tesseract.js';
import https from 'https';
import http from 'http';

const prisma = new PrismaClient();

const downloadBuffer = (url: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      const data: any[] = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
      res.on('error', reject);
    }).on('error', reject);
  });
};

export const processPdf = async (documentId: string, fileUrl: string) => {
  try {
    const buffer = await downloadBuffer(fileUrl);
    
    // Parse PDF text directly where available
    const data = await pdf(buffer);
    const pages = data.text.split('\n\n\n'); // Approximate page splitting
    
    // Create document pages in DB
    for (let i = 0; i < pages.length; i++) {
      const text = pages[i].trim();
      
      let ocrText = null;
      let ocrConfidence = null;

      // If text is extremely short, it might be a scanned PDF, let's run OCR
      // Note: Full image extraction from PDF requires Ghostscript or Canvas, 
      // but for this implementation we simulate the OCR integration using tesseract on a buffer if needed
      if (text.length < 50) {
        try {
           const ocrResult = await Tesseract.recognize(buffer, 'eng');
           ocrText = ocrResult.data.text;
           ocrConfidence = ocrResult.data.confidence;
        } catch (ocrErr) {
           console.error('OCR failed', ocrErr);
        }
      }

      await prisma.documentPage.create({
        data: {
          documentId,
          pageNumber: i + 1,
          rawText: text,
          ocrText: ocrText,
          ocrConfidence: ocrConfidence,
        }
      });
    }

    // Update total pages
    await prisma.document.update({
      where: { id: documentId },
      data: { totalPages: pages.length }
    });

  } catch (err) {
    throw new Error(`Failed to process PDF: ${(err as any).message}`);
  }
};
