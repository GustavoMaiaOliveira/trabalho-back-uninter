import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Appointment } from './Appointment';
import { MedicalRecord } from './MedicalRecord';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { eager: true, cascade: true })
  @JoinColumn()
  user!: User;

  @Column({ unique: true, length: 14 })
  cpf!: string;

  @Column({ type: 'date' })
  birthDate!: Date;

  @Column({ nullable: true, length: 5 })
  bloodType?: string;

  @Column({ type: 'text', nullable: true })
  allergies?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ nullable: true })
  healthInsurance?: string;

  @Column({ nullable: true })
  healthInsuranceNumber?: string;

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments!: Appointment[];

  @OneToMany(() => MedicalRecord, (record) => record.patient)
  medicalRecords!: MedicalRecord[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
