import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { WorkshopStatus } from '../../../common/enums/workshop-status.enum.js';

export class FilterWorkshopDto {
  @ApiPropertyOptional({
    enum: WorkshopStatus,
    example: WorkshopStatus.ACTIVE,
    description: 'Filtrar talleres por estado (ACTIVE o INACTIVE)',
  })
  @IsOptional()
  @IsEnum(WorkshopStatus, {
    message: 'El estado debe ser ACTIVE o INACTIVE',
  })
  status?: WorkshopStatus;
}
