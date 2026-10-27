import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { VehicleStatus } from '../../../common/enums/vehicle-status.enum.js';

export class UpdateVehicleDto {
  @ApiPropertyOptional({
    example: 'Chevrolet',
    description: 'Marca del vehículo',
  })
  @IsOptional()
  @IsString({ message: 'La marca debe ser una cadena de texto' })
  brand?: string;

  @ApiPropertyOptional({
    example: 'NPR Turbo',
    description: 'Modelo o línea del vehículo',
  })
  @IsOptional()
  @IsString({ message: 'El modelo debe ser una cadena de texto' })
  model?: string;

  @ApiPropertyOptional({
    example: 2023,
    description: 'Año de fabricación del vehículo',
  })
  @IsOptional()
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(1900, { message: 'El año no puede ser anterior a 1900' })
  year?: number;

  @ApiPropertyOptional({
    example: 52000,
    description: 'Kilometraje actual del vehículo',
  })
  @IsOptional()
  @IsInt({ message: 'El kilometraje debe ser un número entero' })
  @Min(0, { message: 'El kilometraje no puede ser negativo' })
  mileage?: number;

  @ApiPropertyOptional({
    enum: VehicleStatus,
    example: VehicleStatus.INACTIVE,
    description: 'Estado operativo del vehículo',
  })
  @IsOptional()
  @IsEnum(VehicleStatus, {
    message: 'El estado debe ser AVAILABLE, IN_MAINTENANCE o INACTIVE',
  })
  status?: VehicleStatus;
}
