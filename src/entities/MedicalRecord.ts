import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from './Patient';
import { Professional } from './Professional';
import { Appointment } from './Appointment';
import { Prescription } from './Prescription';

export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
}

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Patient, (patient) => patient.medicalRecords, { eager: true })
  @JoinColumn()
  patient!: Patient;

  @ManyToOne(() => Professional, { eager: true })
  @JoinColumn()
  professional!: Professional;

  @ManyToOne(() => Appointment, { nullable: true, eager: true })
  @JoinColumn()
  appointment?: Appointment;

  @Column({ type: 'text' })
  anamnesis!: string;

  @Column({ type: 'text', nullable: true })
  diagnosis?: string;

  @Column({ type: 'text', nullable: true })
  treatment?: string;

  @Column({ type: 'jsonb', nullable: true })
  vitalSigns?: VitalSigns;

  @Column({ type: 'text', nullable: true })
  observations?: string;

  @OneToMany(() => Prescription, (prescription) => prescription.medicalRecord, {
    cascade: true,
  })
  prescriptions!: Prescription[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
