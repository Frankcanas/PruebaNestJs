import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WorkshopStatus } from '../../../common/enums/workshop-status.enum.js';

export class CreateWorkshopDto {
  @ApiProperty({
    example: 'Taller Central Norte',
    description: 'Nombre de la sede física o taller mecánico',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @ApiProperty({
    example: 'Av. Industrial 45 # 12-30',
    description: 'Dirección física del taller',
  })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  address: string;

  @ApiPropertyOptional({
    enum: WorkshopStatus,
    example: WorkshopStatus.ACTIVE,
    description: 'Estado inicial del taller (por defecto ACTIVE)',
  })
  @IsOptional()
  @IsEnum(WorkshopStatus, {
    message: 'El estado debe ser ACTIVE o INACTIVE',
  })
  status?: WorkshopStatus;
}
