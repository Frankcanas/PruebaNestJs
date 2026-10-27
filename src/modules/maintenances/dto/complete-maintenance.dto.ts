import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { MaintenanceStatus } from '../../../common/enums/maintenance-status.enum.js';

export class CompleteMaintenanceDto {
  @ApiPropertyOptional({
    enum: MaintenanceStatus,
    example: MaintenanceStatus.COMPLETED,
    description: 'Estado de cierre (por defecto COMPLETED)',
  })
  @IsOptional()
  @IsEnum(MaintenanceStatus, {
    message: 'El estado debe ser COMPLETED',
  })
  status?: MaintenanceStatus;

  @ApiProperty({
    example: 'Cambio de pastillas de frenos y purga de líquido',
    description: 'Descripción del trabajo técnico realizado',
  })
  @IsString({ message: 'El trabajo realizado debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El campo workDone es obligatorio para liquidar el mantenimiento' })
  workDone: string;

  @ApiProperty({
    example: 350000,
    description: 'Costo total liquidado del mantenimiento',
  })
  @IsNumber({}, { message: 'El costo debe ser un valor numérico' })
  @Min(0, { message: 'El costo no puede ser negativo' })
  @IsNotEmpty({ message: 'El costo es obligatorio para liquidar el mantenimiento' })
  cost: number;

  @ApiProperty({
    example: '2026-11-05T12:00:00.000Z',
    description: 'Fecha y hora real de finalización de los trabajos',
  })
  @IsDateString({}, { message: 'finishedAt debe ser una fecha ISO válida' })
  @IsNotEmpty({ message: 'La fecha de finalización es obligatoria' })
  finishedAt: string;

  @ApiProperty({
    example: 45200,
    description: 'Kilometraje final al completar la orden',
  })
  @IsInt({ message: 'El kilometraje debe ser un número entero' })
  @Min(0, { message: 'El kilometraje no puede ser negativo' })
  @IsNotEmpty({ message: 'El kilometraje final es obligatorio' })
  mileage: number;
}
