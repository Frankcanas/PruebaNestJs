import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { MaintenanceStatus } from '../../../common/enums/maintenance-status.enum.js';

export class FilterMaintenanceDto {
  @ApiPropertyOptional({
    enum: MaintenanceStatus,
    description: 'Filtrar por estado del mantenimiento',
  })
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del vehículo',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vehicleId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del mecánico asignado',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  mechanicId?: number;
}
