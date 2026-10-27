import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mechanic } from './entities/mechanic.entity.js';
import { CreateMechanicDto } from './dto/create-mechanic.dto.js';
import { UpdateMechanicDto } from './dto/update-mechanic.dto.js';
import { MechanicStatus } from '../../common/enums/mechanic-status.enum.js';
import { ValidateAvailabilityDto } from './dto/validate-availability.dto.js';

@Injectable()
export class MechanicsService {
  constructor(
    @InjectRepository(Mechanic)
    private readonly mechanicRepository: Repository<Mechanic>,
  ) {}

  async create(createMechanicDto: CreateMechanicDto): Promise<Mechanic> {
    const existingMechanic = await this.mechanicRepository.findOne({
      where: { email: createMechanicDto.email },
    });

    if (existingMechanic) {
      throw new ConflictException(
        'El correo del mecánico ya se encuentra registrado',
      );
    }

    const newMechanic = this.mechanicRepository.create({
      ...createMechanicDto,
      status: MechanicStatus.ACTIVE,
    });

    return this.mechanicRepository.save(newMechanic);
  }

  async findAll(): Promise<Mechanic[]> {
    return this.mechanicRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findById(id: number): Promise<Mechanic> {
    const mechanic = await this.mechanicRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!mechanic) {
      throw new NotFoundException('Mecánico no encontrado');
    }

    return mechanic;
  }

  async update(
    id: number,
    updateMechanicDto: UpdateMechanicDto,
  ): Promise<Mechanic> {
    const mechanic = await this.findById(id);

    if (
      updateMechanicDto.email &&
      updateMechanicDto.email !== mechanic.email
    ) {
      const emailInUse = await this.mechanicRepository.findOne({
        where: { email: updateMechanicDto.email },
      });
      if (emailInUse) {
        throw new ConflictException(
          'El correo del mecánico ya se encuentra registrado',
        );
      }
    }

    Object.assign(mechanic, updateMechanicDto);
    return this.mechanicRepository.save(mechanic);
  }

  async inactivate(id: number): Promise<Mechanic> {
    const mechanic = await this.findById(id);
    mechanic.status = MechanicStatus.INACTIVE;
    return this.mechanicRepository.save(mechanic);
  }

  async validateAvailability(
    id: number,
    _dto: ValidateAvailabilityDto,
  ): Promise<{ available: boolean; message: string }> {
    const mechanic = await this.findById(id);

    if (mechanic.status === MechanicStatus.INACTIVE) {
      throw new ConflictException(
        'No se puede asignar un mantenimiento a un mecánico inactivo',
      );
    }

    return {
      available: true,
      message: 'Mecánico activo y disponible para el horario solicitado',
    };
  }
}
