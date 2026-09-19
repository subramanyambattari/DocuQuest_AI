import { PrismaClient } from '@prisma/client';
import { extractQuestionsFromText } from './ai.service';

const prisma = new PrismaClient();

export const runExtractionPipeline = async (documentId: string) => {
  const pages = await prisma.documentPage.findMany({
    where: { documentId },
    orderBy: { pageNumber: 'asc' }
  });

  // For each page, we run AI extraction. 
  // (In a highly scalable system, we would batch pages or process them in parallel with rate limiting)
  for (const page of pages) {
    const textToProcess = page.rawText || page.ocrText;
    if (!textToProcess || textToProcess.length < 20) continue;

    const extractedData = await extractQuestionsFromText(textToProcess);

    for (const data of extractedData) {
      // 1. Confidence Engine Scoring
      // We combine the AI's internal confidence with our OCR confidence (if applicable)
      let finalConfidence = data.confidenceScore;
      if (page.ocrConfidence && page.ocrConfidence < 80) {
         // Penalize confidence if OCR quality was poor
         finalConfidence = finalConfidence * (page.ocrConfidence / 100);
      }

      // 2. Determine Status based on Confidence
      const status = finalConfidence < 0.8 ? 'NEEDS_REVIEW' : 'EXTRACTED';

      // 3. Save the Question
      const question = await prisma.question.create({
        data: {
          documentId,
          questionNumber: data.questionNumber,
          questionText: data.questionText,
          questionType: 'MULTIPLE_CHOICE',
          confidence: finalConfidence,
          status,
          startPage: page.pageNumber,
          endPage: page.pageNumber,
          rawExtraction: JSON.stringify(data),
          
          options: {
            create: data.options.map(opt => ({
              optionKey: opt.optionKey,
              optionText: opt.optionText,
              confidence: finalConfidence
            }))
          },
          
          // 4. Answer Key Association
          // If the AI found an answer, save it
          ...(data.answerValue && {
            answers: {
              create: {
                answerValue: data.answerValue,
                answerSource: 'AI_EXTRACTION',
                confidence: finalConfidence,
                matched: true,
                status: 'MATCHED'
              }
            }
          })
        }
      });

      // 5. Generate Review Items for uncertain extractions
      if (status === 'NEEDS_REVIEW') {
        await prisma.reviewItem.create({
          data: {
            documentId,
            questionId: question.id,
            issueType: 'LOW_CONFIDENCE_EXTRACTION',
            description: `The extraction engine reported a low confidence score of ${(finalConfidence * 100).toFixed(1)}%. Please manually verify the text and options.`,
            confidence: finalConfidence
          }
        });
      }
    }
  }
};
