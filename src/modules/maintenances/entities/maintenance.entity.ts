import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MaintenanceStatus } from '../../../common/enums/maintenance-status.enum.js';
import { MaintenanceType } from '../../../common/enums/maintenance-type.enum.js';
import { Vehicle } from '../../vehicles/entities/vehicle.entity.js';
import { Mechanic } from '../../mechanics/entities/mechanic.entity.js';
import { Workshop } from '../../workshops/entities/workshop.entity.js';

@Entity('maintenances')
export class Maintenance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: MaintenanceType,
  })
  type: MaintenanceType;

  @Column({
    type: 'enum',
    enum: MaintenanceStatus,
    default: MaintenanceStatus.SCHEDULED,
  })
  status: MaintenanceStatus;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  mileage: number;

  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  @Column({ type: 'text', nullable: true })
  workDone: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  cost: number;

  @Column({ type: 'timestamp', nullable: true })
  finishedAt: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @Column()
  vehicleId: number;

  @ManyToOne(() => Vehicle, { eager: true })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column()
  mechanicId: number;

  @ManyToOne(() => Mechanic, { eager: true })
  @JoinColumn({ name: 'mechanicId' })
  mechanic: Mechanic;

  @Column()
  workshopId: number;

  @ManyToOne(() => Workshop, { eager: true })
  @JoinColumn({ name: 'workshopId' })
  workshop: Workshop;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
