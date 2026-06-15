import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { QueryFailedError } from 'typeorm';

export const errorMiddleware = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (error instanceof QueryFailedError) {
    const detail = (error as any).detail;
    if (detail?.includes('already exists')) {
      res.status(409).json({ message: 'Registro já existe com esses dados.' });
      return;
    }
    res.status(400).json({ message: 'Erro na operação com o banco de dados.' });
    return;
  }

  console.error('[Error]', error);
  res.status(500).json({ message: 'Erro interno do servidor.' });
};
