import { Router } from 'express';
import { BedController } from '../controllers/bed.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();
const ctrl = new BedController();

router.use(authenticate);

router.get('/', authorize(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE), ctrl.list.bind(ctrl));
router.post('/', authorize(UserRole.ADMIN), ctrl.create.bind(ctrl));
router.post('/:id/admit', authorize(UserRole.ADMIN, UserRole.NURSE), ctrl.admit.bind(ctrl));
router.post('/:id/discharge', authorize(UserRole.ADMIN, UserRole.NURSE), ctrl.discharge.bind(ctrl));
router.patch('/:id/status', authorize(UserRole.ADMIN), ctrl.updateStatus.bind(ctrl));

export { router as bedRoutes };
