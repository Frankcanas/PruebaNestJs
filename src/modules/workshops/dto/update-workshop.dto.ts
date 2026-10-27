import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WorkshopStatus } from '../../../common/enums/workshop-status.enum.js';

export class UpdateWorkshopDto {
  @ApiPropertyOptional({
    example: 'Taller Central Norte Renombrado',
    description: 'Nombre de la sede física o taller mecánico',
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name?: string;

  @ApiPropertyOptional({
    example: 'Calle 100 # 15-20',
    description: 'Dirección física del taller',
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  address?: string;

  @ApiPropertyOptional({
    enum: WorkshopStatus,
    example: WorkshopStatus.INACTIVE,
    description: 'Estado operativo del taller (ACTIVE o INACTIVE)',
  })
  @IsOptional()
  @IsEnum(WorkshopStatus, {
    message: 'El estado debe ser ACTIVE o INACTIVE',
  })
  status?: WorkshopStatus;
}
