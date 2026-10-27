import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMechanicDto {
  @ApiProperty({
    example: 'Carlos Pérez',
    description: 'Nombre completo del mecánico',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @ApiProperty({
    example: 'carlos.perez@fleetcore.com',
    description: 'Correo electrónico único del mecánico',
  })
  @IsEmail({}, { message: 'El correo electrónico debe ser una dirección válida' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @ApiProperty({
    example: 'Frenos y Suspensión',
    description: 'Especialidad técnica del mecánico',
  })
  @IsString({ message: 'La especialidad debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La especialidad es obligatoria' })
  specialty: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'ID de usuario TECHNICIAN asociado en caso de contar con cuenta',
  })
  @IsOptional()
  @IsInt({ message: 'El userId debe ser un número entero' })
  userId?: number;
}
