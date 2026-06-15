import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { patientRoutes } from './patient.routes';
import { professionalRoutes } from './professional.routes';
import { appointmentRoutes } from './appointment.routes';
import { medicalRecordRoutes } from './medicalRecord.routes';
import { bedRoutes } from './bed.routes';

export const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/professionals', professionalRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/medical-records', medicalRecordRoutes);
router.use('/beds', bedRoutes);
