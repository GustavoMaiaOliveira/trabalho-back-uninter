import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();
const ctrl = new PatientController();

router.use(authenticate);

router.get('/', authorize(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE), ctrl.list.bind(ctrl));
router.post('/', authorize(UserRole.ADMIN), ctrl.create.bind(ctrl));
router.get(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.PATIENT),
  ctrl.getById.bind(ctrl)
);
router.put('/:id', authorize(UserRole.ADMIN, UserRole.NURSE), ctrl.update.bind(ctrl));
router.delete('/:id', authorize(UserRole.ADMIN), ctrl.deactivate.bind(ctrl));

export { router as patientRoutes };
