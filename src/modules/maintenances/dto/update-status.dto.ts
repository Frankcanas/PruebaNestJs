import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MaintenanceStatus } from '../../../common/enums/maintenance-status.enum.js';

export class UpdateMaintenanceStatusDto {
  @ApiProperty({
    enum: MaintenanceStatus,
    example: MaintenanceStatus.IN_PROGRESS,
    description: 'Nuevo estado del mantenimiento (IN_PROGRESS, CANCELLED)',
  })
  @IsEnum(MaintenanceStatus, {
    message: 'El estado debe ser SCHEDULED, IN_PROGRESS, COMPLETED o CANCELLED',
  })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  status: MaintenanceStatus;

  @ApiPropertyOptional({
    example: 'Repuestos no disponibles en la sede',
    description: 'Motivo de anulación en caso de cancelar el mantenimiento',
  })
  @IsOptional()
  @IsString({ message: 'El motivo de cancelación debe ser una cadena de texto' })
  cancellationReason?: string;
}
