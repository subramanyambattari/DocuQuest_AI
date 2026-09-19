import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

import authRouter from './api/auth';
import documentRouter from './api/documents';
import { initializeStorage } from './services/storage.service';

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/documents', documentRouter);

app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Document Intelligence API (Node.js) is running' });
});

initializeStorage();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
