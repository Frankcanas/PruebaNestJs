import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workshop } from './entities/workshop.entity.js';
import { CreateWorkshopDto } from './dto/create-workshop.dto.js';
import { UpdateWorkshopDto } from './dto/update-workshop.dto.js';
import { FilterWorkshopDto } from './dto/filter-workshop.dto.js';
import { WorkshopStatus } from '../../common/enums/workshop-status.enum.js';

@Injectable()
export class WorkshopsService {
  constructor(
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
  ) {}

  async create(createWorkshopDto: CreateWorkshopDto): Promise<Workshop> {
    const workshop = this.workshopRepository.create({
      ...createWorkshopDto,
      status: createWorkshopDto.status || WorkshopStatus.ACTIVE,
    });
    return this.workshopRepository.save(workshop);
  }

  async findAll(filterDto?: FilterWorkshopDto): Promise<Workshop[]> {
    if (filterDto?.status) {
      return this.workshopRepository.find({
        where: { status: filterDto.status },
        order: { id: 'ASC' },
      });
    }

    return this.workshopRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findActive(): Promise<Workshop[]> {
    return this.workshopRepository.find({
      where: { status: WorkshopStatus.ACTIVE },
      order: { id: 'ASC' },
    });
  }

  async findById(id: number): Promise<Workshop> {
    const workshop = await this.workshopRepository.findOne({
      where: { id },
    });

    if (!workshop) {
      throw new NotFoundException('Taller no encontrado');
    }

    return workshop;
  }

  async update(
    id: number,
    updateWorkshopDto: UpdateWorkshopDto,
  ): Promise<Workshop> {
    const workshop = await this.findById(id);
    Object.assign(workshop, updateWorkshopDto);
    return this.workshopRepository.save(workshop);
  }

  async inactivate(id: number): Promise<Workshop> {
    const workshop = await this.findById(id);
    workshop.status = WorkshopStatus.INACTIVE;
    return this.workshopRepository.save(workshop);
  }
}
