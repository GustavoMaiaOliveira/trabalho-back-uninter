import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from './Patient';

export enum BedStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved',
}

@Entity('beds')
export class Bed {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  unit!: string;

  @Column()
  number!: string;

  @Column()
  floor!: string;

  @Column({ default: 'Geral' })
  ward!: string;

  @Column({
    type: 'enum',
    enum: BedStatus,
    default: BedStatus.AVAILABLE,
  })
  status!: BedStatus;

  @ManyToOne(() => Patient, { nullable: true, eager: true })
  @JoinColumn()
  patient?: Patient;

  @Column({ type: 'timestamptz', nullable: true })
  admittedAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
