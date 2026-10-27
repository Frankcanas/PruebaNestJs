import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser una dirección válida' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @IsString({ message: 'La contraseña es obligatoria' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}
