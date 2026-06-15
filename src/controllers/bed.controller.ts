import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Bed, BedStatus } from '../entities/Bed';
import { AuditService } from '../services/audit.service';
import { AppError } from '../errors/AppError';
import { z } from 'zod';

const createSchema = z.object({
  unit: z.string().min(2),
  number: z.string().min(1),
  floor: z.string().min(1),
  ward: z.string().optional(),
});

export class BedController {
  private get repo() {
    return AppDataSource.getRepository(Bed);
  }

  async list(req: Request, res: Response): Promise<Response> {
    const { status, unit } = req.query;
    const qb = this.repo.createQueryBuilder('b').leftJoinAndSelect('b.patient', 'p');

    if (status) qb.where('b.status = :status', { status });
    if (unit) qb.andWhere('b.unit ILIKE :unit', { unit: `%${unit}%` });

    const beds = await qb.orderBy('b.unit').addOrderBy('b.number').getMany();
    return res.json(beds);
  }

  async create(req: Request, res: Response): Promise<Response> {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);

    const existing = await this.repo.findOne({
      where: { unit: parsed.data.unit, number: parsed.data.number },
    });
    if (existing) throw new AppError('Leito já cadastrado nesta unidade.', 409);

    const bed = this.repo.create(parsed.data);
    await this.repo.save(bed);

    return res.status(201).json(bed);
  }

  async admit(req: Request, res: Response): Promise<Response> {
    const { patientId } = req.body;
    if (!patientId) throw new AppError('patientId é obrigatório.', 400);

    const bed = await this.repo.findOne({ where: { id: req.params.id } });
    if (!bed) throw new AppError('Leito não encontrado.', 404);
    if (bed.status !== BedStatus.AVAILABLE) {
      throw new AppError('Leito não está disponível.', 409);
    }

    const { Patient } = await import('../entities/Patient');
    const patient = await AppDataSource.getRepository(Patient).findOne({
      where: { id: patientId },
    });
    if (!patient) throw new AppError('Paciente não encontrado.', 404);

    bed.patient = patient;
    bed.status = BedStatus.OCCUPIED;
    bed.admittedAt = new Date();
    await this.repo.save(bed);

    await AuditService.log({
      userId: req.user?.id,
      action: 'ADMIT',
      entity: 'Bed',
      entityId: bed.id,
      details: { patientId },
      ipAddress: req.ip || '',
    });

    return res.json(bed);
  }

  async discharge(req: Request, res: Response): Promise<Response> {
    const bed = await this.repo.findOne({ where: { id: req.params.id } });
    if (!bed) throw new AppError('Leito não encontrado.', 404);
    if (bed.status !== BedStatus.OCCUPIED) {
      throw new AppError('Leito não está ocupado.', 400);
    }

    const patientId = bed.patient?.id;
    bed.patient = undefined as any;
    bed.status = BedStatus.AVAILABLE;
    bed.admittedAt = undefined;
    bed.notes = req.body.notes;
    await this.repo.save(bed);

    await AuditService.log({
      userId: req.user?.id,
      action: 'DISCHARGE',
      entity: 'Bed',
      entityId: bed.id,
      details: { patientId },
      ipAddress: req.ip || '',
    });

    return res.json({ message: 'Alta registrada com sucesso.', bed });
  }

  async updateStatus(req: Request, res: Response): Promise<Response> {
    const { status } = req.body;
    if (!Object.values(BedStatus).includes(status)) {
      throw new AppError('Status inválido.', 400);
    }

    const bed = await this.repo.findOne({ where: { id: req.params.id } });
    if (!bed) throw new AppError('Leito não encontrado.', 404);

    bed.status = status;
    await this.repo.save(bed);
    return res.json(bed);
  }
}
