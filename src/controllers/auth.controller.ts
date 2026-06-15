import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../entities/User';
import { AuditService } from '../services/audit.service';
import { AppError } from '../errors/AppError';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
  role: z.nativeEnum(UserRole),
});

export class AuthController {
  async login(req: Request, res: Response): Promise<Response> {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0].message, 400);
    }

    const { email, password } = parsed.data;
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email AND user.active = true', { email })
      .getOne();

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Credenciais inválidas.', 401);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    await AuditService.log({
      userId: user.id,
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'],
    });

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  }

  async register(req: Request, res: Response): Promise<Response> {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0].message, 400);
    }

    const { name, email, password, role } = parsed.data;
    const userRepo = AppDataSource.getRepository(User);

    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      throw new AppError('Email já cadastrado.', 409);
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = userRepo.create({ name, email, password: hashed, role });
    await userRepo.save(user);

    await AuditService.log({
      userId: req.user?.id,
      action: 'CREATE',
      entity: 'User',
      entityId: user.id,
      ipAddress: req.ip || '',
    });

    return res.status(201).json({
      message: 'Usuário criado com sucesso.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  }

  async me(req: Request, res: Response): Promise<Response> {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.user!.id } });
    if (!user) throw new AppError('Usuário não encontrado.', 404);
    return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  }
}
