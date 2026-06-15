import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Patient } from './entities/Patient';
import { Professional } from './entities/Professional';
import { Appointment } from './entities/Appointment';
import { MedicalRecord } from './entities/MedicalRecord';
import { Prescription } from './entities/Prescription';
import { Bed } from './entities/Bed';
import { AuditLog } from './entities/AuditLog';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'sghss',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Patient, Professional, Appointment, MedicalRecord, Prescription, Bed, AuditLog],
  migrations: ['dist/migrations/*.js'],
});
