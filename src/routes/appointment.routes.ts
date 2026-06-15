import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();
const ctrl = new AppointmentController();

router.use(authenticate);

router.get('/', ctrl.list.bind(ctrl));
router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.PATIENT),
  ctrl.create.bind(ctrl)
);
router.get('/:id', ctrl.getById.bind(ctrl));
router.patch(
  '/:id/status',
  authorize(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE),
  ctrl.updateStatus.bind(ctrl)
);

export { router as appointmentRoutes };
