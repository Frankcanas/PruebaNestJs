import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum.js';

export class RegisterDto {
  @ApiProperty({
    example: 'admin@fleetcore.com',
    description: 'Correo electrónico único del usuario',
  })
  @IsEmail({}, { message: 'El correo electrónico debe ser una dirección válida' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Contraseña segura del usuario (mínimo 6 caracteres)',
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.ADMIN,
    description: 'Rol del usuario en el sistema (ADMIN o TECHNICIAN)',
  })
  @IsEnum(UserRole, {
    message: 'El rol debe ser ADMIN o TECHNICIAN',
  })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  role: UserRole;
}
