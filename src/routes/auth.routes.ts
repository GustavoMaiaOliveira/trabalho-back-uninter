import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();
const ctrl = new AuthController();

router.post('/login', ctrl.login.bind(ctrl));
router.post('/register', authenticate, authorize(UserRole.ADMIN), ctrl.register.bind(ctrl));
router.get('/me', authenticate, ctrl.me.bind(ctrl));

export { router as authRoutes };
