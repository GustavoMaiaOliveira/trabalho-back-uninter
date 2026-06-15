import { Router } from 'express';
import { MedicalRecordController } from '../controllers/medicalRecord.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();
const ctrl = new MedicalRecordController();

router.use(authenticate);

router.get(
  '/patient/:patientId',
  authorize(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE),
  ctrl.listByPatient.bind(ctrl)
);
router.get(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE),
  ctrl.getById.bind(ctrl)
);
router.post(
  '/',
  authorize(UserRole.DOCTOR, UserRole.NURSE),
  ctrl.create.bind(ctrl)
);
router.post(
  '/:id/prescriptions',
  authorize(UserRole.DOCTOR),
  ctrl.addPrescription.bind(ctrl)
);

export { router as medicalRecordRoutes };
