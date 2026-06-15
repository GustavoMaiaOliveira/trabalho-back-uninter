import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { router } from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

export const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'SGHSS API', version: '1.0.0' });
});

app.use('/api/v1', router);
app.use(errorMiddleware);
