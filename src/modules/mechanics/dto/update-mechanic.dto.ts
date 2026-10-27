import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { MechanicStatus } from '../../../common/enums/mechanic-status.enum.js';

export class UpdateMechanicDto {
  @ApiPropertyOptional({
    example: 'Carlos Pérez',
    description: 'Nombre del mecánico',
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name?: string;

  @ApiPropertyOptional({
    example: 'carlos.perez@fleetcore.com',
    description: 'Correo electrónico del mecánico',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  email?: string;

  @ApiPropertyOptional({
    example: 'Motor Diésel',
    description: 'Especialidad del mecánico',
  })
  @IsOptional()
  @IsString({ message: 'La especialidad debe ser una cadena de texto' })
  specialty?: string;

  @ApiPropertyOptional({
    enum: MechanicStatus,
    example: MechanicStatus.ACTIVE,
    description: 'Estado operativo del mecánico (ACTIVE o INACTIVE)',
  })
  @IsOptional()
  @IsEnum(MechanicStatus, {
    message: 'El estado debe ser ACTIVE o INACTIVE',
  })
  status?: MechanicStatus;

  @ApiPropertyOptional({
    example: 2,
    description: 'ID del usuario asociado',
  })
  @IsOptional()
  @IsInt({ message: 'El userId debe ser un número entero' })
  userId?: number;
}
