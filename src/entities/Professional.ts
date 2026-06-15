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

export enum ProfessionalType {
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  TECHNICIAN = 'technician',
  PHYSIOTHERAPIST = 'physiotherapist',
}

@Entity('professionals')
export class Professional {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { eager: true, cascade: true })
  @JoinColumn()
  user!: User;

  @Column({ unique: true })
  registrationNumber!: string;

  @Column({ type: 'enum', enum: ProfessionalType })
  type!: ProfessionalType;

  @Column()
  specialty!: string;

  @Column()
  department!: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ default: true })
  active!: boolean;

  @OneToMany(() => Appointment, (appointment) => appointment.professional)
  appointments!: Appointment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
