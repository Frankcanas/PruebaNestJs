import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity.js';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import { VehicleStatus } from '../../common/enums/vehicle-status.enum.js';
import { Maintenance } from '../maintenances/entities/maintenance.entity.js';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const existingVehicle = await this.vehicleRepository.findOne({
      where: { plate: createVehicleDto.plate },
    });

    if (existingVehicle) {
      throw new ConflictException(
        'Ya existe un vehículo registrado con la placa indicada',
      );
    }

    const newVehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      status: VehicleStatus.AVAILABLE,
    });

    return this.vehicleRepository.save(newVehicle);
  }

  async findAll(): Promise<Vehicle[]> {
    return this.vehicleRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findById(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    return vehicle;
  }

  async findByPlate(plate: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { plate },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    return vehicle;
  }

  async update(
    id: number,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    const vehicle = await this.findById(id);

    Object.assign(vehicle, updateVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }

  async inactivate(id: number): Promise<Vehicle> {
    const vehicle = await this.findById(id);

    vehicle.status = VehicleStatus.INACTIVE;
    return this.vehicleRepository.save(vehicle);
  }

  async getHistory(id: number) {
    const vehicle = await this.findById(id);
    const maintenances = await this.maintenanceRepository.find({
      where: { vehicleId: id },
      relations: { mechanic: true, workshop: true },
      order: { scheduledDate: 'DESC' },
    });

    return {
      vehicle: {
        id: vehicle.id,
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        available: vehicle.status === VehicleStatus.AVAILABLE,
        status: vehicle.status,
      },
      maintenances,
    };
  }

  async getHistoryByPlate(plate: string) {
    const vehicle = await this.findByPlate(plate);
    const maintenances = await this.maintenanceRepository.find({
      where: { vehicleId: vehicle.id },
      relations: { mechanic: true, workshop: true },
      order: { scheduledDate: 'DESC' },
    });

    return {
      vehicle: {
        id: vehicle.id,
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        available: vehicle.status === VehicleStatus.AVAILABLE,
        status: vehicle.status,
      },
      maintenances,
    };
  }
}
