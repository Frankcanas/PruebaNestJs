import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class ValidateAvailabilityDto {
  @ApiProperty({
    example: '2026-11-01T08:00:00.000Z',
    description: 'Fecha y hora programada del mantenimiento',
  })
  @IsDateString({}, { message: 'scheduledDate debe tener un formato ISO válido' })
  @IsNotEmpty({ message: 'scheduledDate es obligatorio' })
  scheduledDate: string;

  @ApiPropertyOptional({
    example: 90,
    description: 'Duración estimada en minutos (por defecto 60 min)',
  })
  @IsOptional()
  @IsInt({ message: 'durationMinutes debe ser un número entero' })
  @Min(1, { message: 'durationMinutes debe ser de al menos 1 minuto' })
  durationMinutes?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID de taller opcional donde se ejecutará',
  })
  @IsOptional()
  @IsInt({ message: 'workshopId debe ser un número entero' })
  workshopId?: number;
}
