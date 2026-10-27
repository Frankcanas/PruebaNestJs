import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';
import { MaintenanceType } from '../../../common/enums/maintenance-type.enum.js';

export class CreateMaintenanceDto {
  @ApiProperty({
    enum: MaintenanceType,
    example: MaintenanceType.PREVENTIVE,
    description: 'Tipo de mantenimiento (PREVENTIVE o CORRECTIVE)',
  })
  @IsEnum(MaintenanceType, {
    message: 'El tipo debe ser PREVENTIVE o CORRECTIVE',
  })
  @IsNotEmpty({ message: 'El tipo de mantenimiento es obligatorio' })
  type: MaintenanceType;

  @ApiProperty({
    example: 'Cambio de aceite, filtros y revisión de frenos',
    description: 'Descripción detallada de la intervención requerida',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description: string;

  @ApiProperty({
    example: 45000,
    description: 'Kilometraje registrado al momento de programar la orden (>= actual)',
  })
  @IsInt({ message: 'El kilometraje debe ser un número entero' })
  @Min(0, { message: 'El kilometraje no puede ser negativo' })
  @IsNotEmpty({ message: 'El kilometraje es obligatorio' })
  mileage: number;

  @ApiProperty({
    example: '2026-11-05T08:00:00.000Z',
    description: 'Fecha y hora programada para el mantenimiento',
  })
  @IsDateString({}, { message: 'La fecha scheduledDate debe ser una fecha ISO válida' })
  @IsNotEmpty({ message: 'La fecha programada es obligatoria' })
  scheduledDate: string;

  @ApiProperty({
    example: 1,
    description: 'ID del vehículo a intervenir',
  })
  @IsInt({ message: 'vehicleId debe ser un número entero' })
  @IsNotEmpty({ message: 'vehicleId es obligatorio' })
  vehicleId: number;

  @ApiProperty({
    example: 1,
    description: 'ID del mecánico responsable asignado',
  })
  @IsInt({ message: 'mechanicId debe ser un número entero' })
  @IsNotEmpty({ message: 'mechanicId es obligatorio' })
  mechanicId: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la sede o taller mecánico donde se realizará la intervención',
  })
  @IsInt({ message: 'workshopId debe ser un número entero' })
  @IsNotEmpty({ message: 'workshopId es obligatorio' })
  workshopId: number;
}
