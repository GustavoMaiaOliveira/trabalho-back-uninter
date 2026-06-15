import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Professional, ProfessionalType } from '../entities/Professional';
import { AuditService } from '../services/audit.service';
import { AppError } from '../errors/AppError';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  registrationNumber: z.string().min(4),
  type: z.nativeEnum(ProfessionalType),
  specialty: z.string().min(3),
  department: z.string().min(2),
  phone: z.string().optional(),
});

export class ProfessionalController {
  private get repo() {
    return AppDataSource.getRepository(Professional);
  }

  async list(_req: Request, res: Response): Promise<Response> {
    const professionals = await this.repo.find({ order: { createdAt: 'DESC' } });
    return res.json(professionals);
  }

  async getById(req: Request, res: Response): Promise<Response> {
    const prof = await this.repo.findOne({
      where: { id: req.params.id },
      relations: ['appointments'],
    });
    if (!prof) throw new AppError('Profissional não encontrado.', 404);
    return res.json(prof);
  }

  async create(req: Request, res: Response): Promise<Response> {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);

    const { name, email, password, registrationNumber, type, specialty, department, phone } =
      parsed.data;

    const bcrypt = await import('bcryptjs');
    const hashed = await bcrypt.hash(password, 12);

    const { UserRole, User } = await import('../entities/User');
    const userRepo = AppDataSource.getRepository(User);

    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) throw new AppError('Email já cadastrado.', 409);

    const existingReg = await this.repo.findOne({ where: { registrationNumber } });
    if (existingReg) throw new AppError('Número de registro já cadastrado.', 409);

    const roleMap: Record<ProfessionalType, UserRole> = {
      [ProfessionalType.DOCTOR]: UserRole.DOCTOR,
      [ProfessionalType.NURSE]: UserRole.NURSE,
      [ProfessionalType.TECHNICIAN]: UserRole.TECHNICIAN,
      [ProfessionalType.PHYSIOTHERAPIST]: UserRole.TECHNICIAN,
    };

    const user = userRepo.create({ name, email, password: hashed, role: roleMap[type] });
    const prof = this.repo.create({ user, registrationNumber, type, specialty, department, phone });
    await this.repo.save(prof);

    await AuditService.log({
      userId: req.user?.id,
      action: 'CREATE',
      entity: 'Professional',
      entityId: prof.id,
      ipAddress: req.ip || '',
    });

    return res.status(201).json(prof);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const prof = await this.repo.findOne({ where: { id: req.params.id } });
    if (!prof) throw new AppError('Profissional não encontrado.', 404);

    const allowed = ['specialty', 'department', 'phone', 'active'];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) (prof as any)[key] = req.body[key];
    });

    if (req.body.name) prof.user.name = req.body.name;

    await this.repo.save(prof);

    await AuditService.log({
      userId: req.user?.id,
      action: 'UPDATE',
      entity: 'Professional',
      entityId: prof.id,
      ipAddress: req.ip || '',
    });

    return res.json(prof);
  }

  async getSchedule(req: Request, res: Response): Promise<Response> {
    const { Appointment } = await import('../entities/Appointment');
    const appRepo = AppDataSource.getRepository(Appointment);
    const { from, to } = req.query;

    const qb = appRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.patient', 'p')
      .leftJoinAndSelect('p.user', 'u')
      .where('a.professional.id = :id', { id: req.params.id })
      .orderBy('a.scheduledAt', 'ASC');

    if (from) qb.andWhere('a.scheduledAt >= :from', { from });
    if (to) qb.andWhere('a.scheduledAt <= :to', { to });

    const schedule = await qb.getMany();
    return res.json(schedule);
  }
}
