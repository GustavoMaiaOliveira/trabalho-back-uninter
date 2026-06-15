import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { MedicalRecord } from './MedicalRecord';
import { Professional } from './Professional';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => MedicalRecord, (record) => record.prescriptions)
  @JoinColumn()
  medicalRecord!: MedicalRecord;

  @ManyToOne(() => Professional, { eager: true })
  @JoinColumn()
  professional!: Professional;

  @Column({ type: 'jsonb' })
  medications!: Medication[];

  @Column({ type: 'text', nullable: true })
  observations?: string;

  @Column({ default: false })
  dispensed!: boolean;

  @Column({ type: 'date', nullable: true })
  validUntil?: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
