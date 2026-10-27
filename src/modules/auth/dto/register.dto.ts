import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum.js';

export class RegisterDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser una dirección válida' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsEnum(UserRole, {
    message: 'El rol debe ser ADMIN o TECHNICIAN',
  })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  role: UserRole;
}
