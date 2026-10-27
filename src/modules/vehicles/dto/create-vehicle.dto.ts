import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({
    example: 'ABC123',
    description: 'Placa alfanumérica única del vehículo',
  })
  @IsString({ message: 'La placa debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La placa es obligatoria' })
  plate: string;

  @ApiProperty({
    example: 'Chevrolet',
    description: 'Marca del vehículo',
  })
  @IsString({ message: 'La marca debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La marca es obligatoria' })
  brand: string;

  @ApiProperty({
    example: 'NPR',
    description: 'Modelo o línea del vehículo',
  })
  @IsString({ message: 'El modelo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El modelo es obligatorio' })
  model: string;

  @ApiProperty({
    example: 2022,
    description: 'Año de fabricación del vehículo',
  })
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(1900, { message: 'El año no puede ser anterior a 1900' })
  @IsNotEmpty({ message: 'El año es obligatorio' })
  year: number;

  @ApiProperty({
    example: 45000,
    description: 'Kilometraje actual del vehículo (>= 0)',
  })
  @IsInt({ message: 'El kilometraje debe ser un número entero' })
  @Min(0, { message: 'El kilometraje no puede ser negativo' })
  @IsNotEmpty({ message: 'El kilometraje es obligatorio' })
  mileage: number;
}
