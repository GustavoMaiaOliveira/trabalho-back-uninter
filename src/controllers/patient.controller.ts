import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Patient } from '../entities/Patient';
import { AuditService } from '../services/audit.service';
import { AppError } from '../errors/AppError';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  cpf: z.string().length(11, 'CPF deve ter 11 dígitos'),
  birthDate: z.string(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  healthInsurance: z.string().optional(),
  healthInsuranceNumber: z.string().optional(),
});

const updateSchema = createSchema.partial().omit({ password: true, email: true, cpf: true });

export class PatientController {
  private get repo() {
    return AppDataSource.getRepository(Patient);
  }

  async list(req: Request, res: Response): Promise<Response> {
    const { page = '1', limit = '20', search } = req.query;
    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'u')
      .skip((Number(page) - 1) * Number(limit))
      .take(Number(limit))
      .orderBy('u.name', 'ASC');

    if (search) {
      qb.where('u.name ILIKE :s OR p.cpf LIKE :s', { s: `%${search}%` });
    }

    const [data, total] = await qb.getManyAndCount();
    return res.json({ data, total, page: Number(page), limit: Number(limit) });
  }

  async getById(req: Request, res: Response): Promise<Response> {
    const patient = await this.repo.findOne({
      where: { id: req.params.id },
      relations: ['appointments', 'medicalRecords'],
    });
    if (!patient) throw new AppError('Paciente não encontrado.', 404);

    await AuditService.log({
      userId: req.user?.id,
      action: 'READ',
      entity: 'Patient',
      entityId: patient.id,
      ipAddress: req.ip || '',
    });

    return res.json(patient);
  }

  async create(req: Request, res: Response): Promise<Response> {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);

    const { name, email, password, cpf, birthDate, ...rest } = parsed.data;

    const bcrypt = await import('bcryptjs');
    const hashed = await bcrypt.hash(password, 12);

    const { UserRole } = await import('../entities/User');
    const { User } = await import('../entities/User');
    const userRepo = AppDataSource.getRepository(User);

    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) throw new AppError('Email já cadastrado.', 409);

    const existingCpf = await this.repo.findOne({ where: { cpf } });
    if (existingCpf) throw new AppError('CPF já cadastrado.', 409);

    const user = userRepo.create({ name, email, password: hashed, role: UserRole.PATIENT });
    const patient = this.repo.create({ user, cpf, birthDate: new Date(birthDate), ...rest });
    await this.repo.save(patient);

    await AuditService.log({
      userId: req.user?.id,
      action: 'CREATE',
      entity: 'Patient',
      entityId: patient.id,
      ipAddress: req.ip || '',
    });

    return res.status(201).json(patient);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);

    const patient = await this.repo.findOne({ where: { id: req.params.id } });
    if (!patient) throw new AppError('Paciente não encontrado.', 404);

    const { name, ...patientFields } = parsed.data as any;
    if (name) patient.user.name = name;
    Object.assign(patient, patientFields);
    await this.repo.save(patient);

    await AuditService.log({
      userId: req.user?.id,
      action: 'UPDATE',
      entity: 'Patient',
      entityId: patient.id,
      details: parsed.data,
      ipAddress: req.ip || '',
    });

    return res.json(patient);
  }

  async deactivate(req: Request, res: Response): Promise<Response> {
    const patient = await this.repo.findOne({ where: { id: req.params.id } });
    if (!patient) throw new AppError('Paciente não encontrado.', 404);

    patient.user.active = false;
    await this.repo.save(patient);

    await AuditService.log({
      userId: req.user?.id,
      action: 'DEACTIVATE',
      entity: 'Patient',
      entityId: patient.id,
      ipAddress: req.ip || '',
    });

    return res.json({ message: 'Paciente desativado com sucesso.' });
  }
}
