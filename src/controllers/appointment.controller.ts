import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Appointment, AppointmentStatus, AppointmentType } from '../entities/Appointment';
import { AuditService } from '../services/audit.service';
import { AppError } from '../errors/AppError';
import { z } from 'zod';

const createSchema = z.object({
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  type: z.nativeEnum(AppointmentType),
  notes: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus),
  cancellationReason: z.string().optional(),
  videoCallUrl: z.string().url().optional(),
});

export class AppointmentController {
  private get repo() {
    return AppDataSource.getRepository(Appointment);
  }

  async list(req: Request, res: Response): Promise<Response> {
    const { patientId, professionalId, status, from, to, page = '1', limit = '20' } = req.query;

    const qb = this.repo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.patient', 'pat')
      .leftJoinAndSelect('pat.user', 'pu')
      .leftJoinAndSelect('a.professional', 'pro')
      .leftJoinAndSelect('pro.user', 'prou')
      .skip((Number(page) - 1) * Number(limit))
      .take(Number(limit))
      .orderBy('a.scheduledAt', 'ASC');

    if (patientId) qb.andWhere('a.patient.id = :patientId', { patientId });
    if (professionalId) qb.andWhere('a.professional.id = :professionalId', { professionalId });
    if (status) qb.andWhere('a.status = :status', { status });
    if (from) qb.andWhere('a.scheduledAt >= :from', { from });
    if (to) qb.andWhere('a.scheduledAt <= :to', { to });

    const [data, total] = await qb.getManyAndCount();
    return res.json({ data, total, page: Number(page), limit: Number(limit) });
  }

  async getById(req: Request, res: Response): Promise<Response> {
    const appointment = await this.repo.findOne({ where: { id: req.params.id } });
    if (!appointment) throw new AppError('Consulta não encontrada.', 404);
    return res.json(appointment);
  }

  async create(req: Request, res: Response): Promise<Response> {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);

    const { patientId, professionalId, scheduledAt, type, notes } = parsed.data;

    const { Patient } = await import('../entities/Patient');
    const { Professional } = await import('../entities/Professional');

    const patient = await AppDataSource.getRepository(Patient).findOne({
      where: { id: patientId },
    });
    if (!patient) throw new AppError('Paciente não encontrado.', 404);

    const professional = await AppDataSource.getRepository(Professional).findOne({
      where: { id: professionalId },
    });
    if (!professional) throw new AppError('Profissional não encontrado.', 404);

    const conflict = await this.repo.findOne({
      where: {
        professional: { id: professionalId },
        scheduledAt: new Date(scheduledAt),
        status: AppointmentStatus.SCHEDULED,
      },
    });
    if (conflict) throw new AppError('Profissional já possui consulta nesse horário.', 409);

    const appointment = this.repo.create({
      patient,
      professional,
      scheduledAt: new Date(scheduledAt),
      type,
      notes,
    });

    if (type === AppointmentType.TELEMEDICINE) {
      appointment.videoCallUrl = `https://meet.vidaplus.com.br/${appointment.id}`;
    }

    await this.repo.save(appointment);

    await AuditService.log({
      userId: req.user?.id,
      action: 'CREATE',
      entity: 'Appointment',
      entityId: appointment.id,
      ipAddress: req.ip || '',
    });

    return res.status(201).json(appointment);
  }

  async updateStatus(req: Request, res: Response): Promise<Response> {
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);

    const appointment = await this.repo.findOne({ where: { id: req.params.id } });
    if (!appointment) throw new AppError('Consulta não encontrada.', 404);

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new AppError('Consulta já foi concluída.', 400);
    }

    Object.assign(appointment, parsed.data);
    await this.repo.save(appointment);

    await AuditService.log({
      userId: req.user?.id,
      action: 'UPDATE_STATUS',
      entity: 'Appointment',
      entityId: appointment.id,
      details: { status: parsed.data.status },
      ipAddress: req.ip || '',
    });

    return res.json(appointment);
  }
}
