import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Maintenance } from './entities/maintenance.entity.js';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto.js';
import { UpdateMaintenanceStatusDto } from './dto/update-status.dto.js';
import { CompleteMaintenanceDto } from './dto/complete-maintenance.dto.js';
import { FilterMaintenanceDto } from './dto/filter-maintenance.dto.js';
import { MaintenanceStatus } from '../../common/enums/maintenance-status.enum.js';
import { Vehicle } from '../vehicles/entities/vehicle.entity.js';
import { Mechanic } from '../mechanics/entities/mechanic.entity.js';
import { Workshop } from '../workshops/entities/workshop.entity.js';
import { VehicleStatus } from '../../common/enums/vehicle-status.enum.js';
import { MechanicStatus } from '../../common/enums/mechanic-status.enum.js';
import { WorkshopStatus } from '../../common/enums/workshop-status.enum.js';
import { UserRole } from '../../common/enums/user-role.enum.js';

@Injectable()
export class MaintenancesService {
  constructor(
    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Mechanic)
    private readonly mechanicRepository: Repository<Mechanic>,
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createDto: CreateMaintenanceDto): Promise<Maintenance> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: createDto.vehicleId },
    });
    if (!vehicle) {
      throw new NotFoundException('Vehículo no encontrado');
    }
    if (vehicle.status === VehicleStatus.INACTIVE) {
      throw new BadRequestException(
        'Un vehículo en estado INACTIVE no podrá ser asociado a un nuevo mantenimiento',
      );
    }

    const activeVehicleMaintenance = await this.maintenanceRepository.findOne({
      where: {
        vehicleId: vehicle.id,
        status: In([MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS]),
      },
    });
    if (activeVehicleMaintenance) {
      throw new ConflictException(
        `El vehículo ${vehicle.plate} ya tiene un mantenimiento activo`,
      );
    }

    if (createDto.mileage < vehicle.mileage) {
      throw new BadRequestException(
        'El kilometraje registrado no podrá ser inferior al kilometraje actual del vehículo',
      );
    }

    const mechanic = await this.mechanicRepository.findOne({
      where: { id: createDto.mechanicId },
    });
    if (!mechanic) {
      throw new NotFoundException('Mecánico no encontrado');
    }
    if (mechanic.status === MechanicStatus.INACTIVE) {
      throw new BadRequestException(
        'No se puede asignar un mantenimiento a un mecánico inactivo',
      );
    }

    const workshop = await this.workshopRepository.findOne({
      where: { id: createDto.workshopId },
    });
    if (!workshop) {
      throw new NotFoundException('Taller no encontrado');
    }
    if (workshop.status === WorkshopStatus.INACTIVE) {
      throw new BadRequestException(
        'No se puede asignar un mantenimiento a un taller inactivo',
      );
    }

    const scheduledDateObj = new Date(createDto.scheduledDate);
    const existingConflict = await this.maintenanceRepository.findOne({
      where: {
        mechanicId: mechanic.id,
        status: In([MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS]),
        scheduledDate: scheduledDateObj,
      },
    });
    if (existingConflict) {
      throw new ConflictException(
        'El mecánico ya cuenta con un mantenimiento activo en ese horario',
      );
    }

    const maintenance = this.maintenanceRepository.create({
      ...createDto,
      scheduledDate: scheduledDateObj,
      status: MaintenanceStatus.SCHEDULED,
    });

    const saved = await this.maintenanceRepository.save(maintenance);
    return this.findById(saved.id);
  }

  async findAll(filterDto?: FilterMaintenanceDto): Promise<Maintenance[]> {
    const where: any = {};
    if (filterDto?.status) where.status = filterDto.status;
    if (filterDto?.vehicleId) where.vehicleId = filterDto.vehicleId;
    if (filterDto?.mechanicId) where.mechanicId = filterDto.mechanicId;

    return this.maintenanceRepository.find({
      where,
      relations: { vehicle: true, mechanic: true, workshop: true },
      order: { id: 'ASC' },
    });
  }

  async findActive(): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      where: {
        status: In([MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS]),
      },
      relations: { vehicle: true, mechanic: true, workshop: true },
      order: { id: 'ASC' },
    });
  }

  async findMyAssigned(currentUser: any): Promise<Maintenance[]> {
    const mechanic = await this.mechanicRepository.findOne({
      where: { userId: currentUser.id },
    });

    if (!mechanic) {
      return [];
    }

    return this.maintenanceRepository.find({
      where: { mechanicId: mechanic.id },
      relations: { vehicle: true, mechanic: true, workshop: true },
      order: { id: 'ASC' },
    });
  }

  async findById(id: number): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepository.findOne({
      where: { id },
      relations: { vehicle: true, mechanic: true, workshop: true },
    });

    if (!maintenance) {
      throw new NotFoundException('Mantenimiento no encontrado');
    }

    return maintenance;
  }

  async updateStatus(
    id: number,
    dto: UpdateMaintenanceStatusDto,
    currentUser: any,
  ): Promise<Maintenance> {
    const maintenance = await this.findById(id);

    if (maintenance.status === MaintenanceStatus.COMPLETED) {
      throw new ConflictException(
        'Un mantenimiento COMPLETED no podrá regresar a un estado anterior',
      );
    }

    if (maintenance.status === MaintenanceStatus.CANCELLED) {
      throw new ConflictException(
        'Un mantenimiento CANCELLED no podrá posteriormente cambiar a IN_PROGRESS o COMPLETED',
      );
    }

    if (currentUser?.role === UserRole.TECHNICIAN) {
      if (
        !maintenance.mechanic ||
        maintenance.mechanic.userId !== currentUser.id
      ) {
        throw new ForbiddenException(
          'Solo puedes operar sobre los mantenimientos que tengas asignados',
        );
      }
    }

    if (dto.status === MaintenanceStatus.IN_PROGRESS) {
      if (maintenance.status !== MaintenanceStatus.SCHEDULED) {
        throw new BadRequestException(
          'Solo un mantenimiento en estado SCHEDULED puede pasar a IN_PROGRESS',
        );
      }

      await this.dataSource.transaction(async (manager) => {
        maintenance.status = MaintenanceStatus.IN_PROGRESS;
        await manager.save(maintenance);

        const vehicle = await manager.findOne(Vehicle, {
          where: { id: maintenance.vehicleId },
        });
        if (vehicle) {
          vehicle.status = VehicleStatus.IN_MAINTENANCE;
          await manager.save(vehicle);
        }
      });

      return this.findById(id);
    }

    if (dto.status === MaintenanceStatus.CANCELLED) {
      if (
        maintenance.status !== MaintenanceStatus.SCHEDULED &&
        maintenance.status !== MaintenanceStatus.IN_PROGRESS
      ) {
        throw new BadRequestException(
          'Transición de estado no permitida para cancelación',
        );
      }

      await this.dataSource.transaction(async (manager) => {
        maintenance.status = MaintenanceStatus.CANCELLED;
        if (dto.cancellationReason) {
          maintenance.cancellationReason = dto.cancellationReason;
        }
        await manager.save(maintenance);

        const vehicle = await manager.findOne(Vehicle, {
          where: { id: maintenance.vehicleId },
        });
        if (vehicle && vehicle.status === VehicleStatus.IN_MAINTENANCE) {
          vehicle.status = VehicleStatus.AVAILABLE;
          await manager.save(vehicle);
        }
      });

      return this.findById(id);
    }

    if (dto.status === MaintenanceStatus.COMPLETED) {
      throw new BadRequestException(
        'No se podrá completar un mantenimiento si no contiene la información obligatoria de cierre',
      );
    }

    throw new BadRequestException('Transición de estado no permitida');
  }

  async complete(
    id: number,
    dto: CompleteMaintenanceDto,
    currentUser: any,
  ): Promise<Maintenance> {
    const maintenance = await this.findById(id);

    if (maintenance.status === MaintenanceStatus.COMPLETED) {
      throw new ConflictException(
        'Un mantenimiento COMPLETED no podrá regresar a un estado anterior',
      );
    }

    if (maintenance.status === MaintenanceStatus.CANCELLED) {
      throw new ConflictException(
        'Un mantenimiento CANCELLED no podrá posteriormente cambiar a IN_PROGRESS o COMPLETED',
      );
    }

    if (maintenance.status !== MaintenanceStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Un mantenimiento debe estar en estado IN_PROGRESS para poder ser completado',
      );
    }

    if (currentUser?.role === UserRole.TECHNICIAN) {
      if (
        !maintenance.mechanic ||
        maintenance.mechanic.userId !== currentUser.id
      ) {
        throw new ForbiddenException(
          'Solo puedes operar sobre los mantenimientos que tengas asignados',
        );
      }
    }

    if (
      !dto.workDone ||
      dto.cost === undefined ||
      !dto.finishedAt ||
      dto.mileage === undefined
    ) {
      throw new BadRequestException(
        'No se podrá completar un mantenimiento si no contiene la información obligatoria de cierre',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      maintenance.status = MaintenanceStatus.COMPLETED;
      maintenance.workDone = dto.workDone;
      maintenance.cost = dto.cost;
      maintenance.finishedAt = new Date(dto.finishedAt);
      maintenance.mileage = dto.mileage;
      await manager.save(maintenance);

      const vehicle = await manager.findOne(Vehicle, {
        where: { id: maintenance.vehicleId },
      });
      if (vehicle) {
        vehicle.status = VehicleStatus.AVAILABLE;
        vehicle.mileage = Math.max(vehicle.mileage, dto.mileage);
        await manager.save(vehicle);
      }
    });

    return this.findById(id);
  }
}
