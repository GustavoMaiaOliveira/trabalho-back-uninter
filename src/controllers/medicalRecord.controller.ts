import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { MedicalRecord } from '../entities/MedicalRecord';
import { Prescription } from '../entities/Prescription';
import { AuditService } from '../services/audit.service';
import { AppError } from '../errors/AppError';
import { z } from 'zod';

const createRecordSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  anamnesis: z.string().min(10),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  observations: z.string().optional(),
  vitalSigns: z
    .object({
      bloodPressure: z.string().optional(),
      heartRate: z.number().optional(),
      temperature: z.number().optional(),
      oxygenSaturation: z.number().optional(),
      weight: z.number().optional(),
      height: z.number().optional(),
    })
    .optional(),
});

const addPrescriptionSchema = z.object({
  medications: z.array(
    z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      duration: z.string(),
      instructions: z.string().optional(),
    })
  ).min(1),
  observations: z.string().optional(),
  validUntil: z.string().optional(),
});

export class MedicalRecordController {
  private get repo() {
    return AppDataSource.getRepository(MedicalRecord);
  }

  async listByPatient(req: Request, res: Response): Promise<Response> {
    const records = await this.repo.find({
      where: { patient: { id: req.params.patientId } },
      relations: ['prescriptions'],
      order: { createdAt: 'DESC' },
    });
    return res.json(records);
  }

  async getById(req: Request, res: Response): Promise<Response> {
    const record = await this.repo.findOne({
      where: { id: req.params.id },
      relations: ['prescriptions', 'prescriptions.professional'],
    });
    if (!record) throw new AppError('Prontuário não encontrado.', 404);

    await AuditService.log({
      userId: req.user?.id,
      action: 'READ',
      entity: 'MedicalRecord',
      entityId: record.id,
      ipAddress: req.ip || '',
    });

    return res.json(record);
  }

  async create(req: Request, res: Response): Promise<Response> {
    const parsed = createRecordSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);

    const { patientId, appointmentId, ...fields } = parsed.data;

    const { Patient } = await import('../entities/Patient');
    const patient = await AppDataSource.getRepository(Patient).findOne({
      where: { id: patientId },
    });
    if (!patient) throw new AppError('Paciente não encontrado.', 404);

    const { Professional } = await import('../entities/Professional');
    const professional = await AppDataSource.getRepository(Professional).findOne({
      where: { user: { id: req.user!.id } },
    });
    if (!professional) throw new AppError('Profissional não encontrado.', 403);

    const record = this.repo.create({ patient, professional, ...fields });

    if (appointmentId) {
      const { Appointment } = await import('../entities/Appointment');
      const appointment = await AppDataSource.getRepository(Appointment).findOne({
        where: { id: appointmentId },
      });
      if (appointment) record.appointment = appointment;
    }

    await this.repo.save(record);

    await AuditService.log({
      userId: req.user?.id,
      action: 'CREATE',
      entity: 'MedicalRecord',
      entityId: record.id,
      ipAddress: req.ip || '',
    });

    return res.status(201).json(record);
  }

  async addPrescription(req: Request, res: Response): Promise<Response> {
    const parsed = addPrescriptionSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);

    const record = await this.repo.findOne({ where: { id: req.params.id } });
    if (!record) throw new AppError('Prontuário não encontrado.', 404);

    const { Professional } = await import('../entities/Professional');
    const professional = await AppDataSource.getRepository(Professional).findOne({
      where: { user: { id: req.user!.id } },
    });
    if (!professional) throw new AppError('Apenas médicos podem prescrever.', 403);

    const prescRepo = AppDataSource.getRepository(Prescription);
    const prescription = prescRepo.create({
      medicalRecord: record,
      professional,
      medications: parsed.data.medications,
      observations: parsed.data.observations,
      validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : undefined,
    });
    await prescRepo.save(prescription);

    await AuditService.log({
      userId: req.user?.id,
      action: 'CREATE',
      entity: 'Prescription',
      entityId: prescription.id,
      ipAddress: req.ip || '',
    });

    return res.status(201).json(prescription);
  }
}
