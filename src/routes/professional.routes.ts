import { Router } from 'express';
import { ProfessionalController } from '../controllers/professional.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();
const ctrl = new ProfessionalController();

router.use(authenticate);

router.get('/', authorize(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE), ctrl.list.bind(ctrl));
router.post('/', authorize(UserRole.ADMIN), ctrl.create.bind(ctrl));
router.get('/:id', authenticate, ctrl.getById.bind(ctrl));
router.put('/:id', authorize(UserRole.ADMIN), ctrl.update.bind(ctrl));
router.get('/:id/schedule', authenticate, ctrl.getSchedule.bind(ctrl));

export { router as professionalRoutes };
