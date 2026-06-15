import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import { AppDataSource } from './data-source';
import { app } from './app';

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log('[DB] Conexão com PostgreSQL estabelecida com sucesso.');
    app.listen(PORT, () => {
      console.log(`[API] SGHSS rodando em http://localhost:${PORT}`);
      console.log(`[API] Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch((error: Error) => {
    console.error('[DB] Erro ao conectar com o banco de dados:', error.message);
    process.exit(1);
  });
