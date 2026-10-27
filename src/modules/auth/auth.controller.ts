import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UserRole } from '../../common/enums/user-role.enum.js';

@ApiTags('Autenticación y Seguridad (EPI-01)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'HU-01: Registro de Usuarios con Roles Específicos y Hashing Seguro',
    description:
      'Registra un nuevo usuario (ADMIN o TECHNICIAN) almacenando la contraseña hasheada con bcrypt.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o rol no permitido',
  })
  @ApiResponse({
    status: 409,
    description: 'El correo electrónico ya se encuentra registrado',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'HU-02: Inicio de Sesión y Emisión de Token JWT',
    description:
      'Valida credenciales de usuario y emite un JWT firmado para autenticación en rutas privadas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso con token JWT generado',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales de acceso inválidas',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({
    summary: 'HU-03: Perfil del Usuario Autenticado (@CurrentUser)',
    description: 'Retorna los datos del usuario autenticado a partir del token JWT Bearer.',
  })
  @ApiResponse({ status: 200, description: 'Perfil de usuario obtenido' })
  @ApiResponse({ status: 401, description: 'Token de acceso inválido o no proporcionado' })
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @ApiBearerAuth()
  @Get('admin-only')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'HU-03: Ruta Restringida a Administradores (@Roles(ADMIN))',
    description: 'Ejemplo de ruta protegida por RBAC restringida al rol ADMIN.',
  })
  @ApiResponse({ status: 200, description: 'Acceso autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  adminOnly(@CurrentUser() user: any) {
    return {
      message: 'Acceso concedido a zona administrativa',
      user,
    };
  }

  @ApiBearerAuth()
  @Get('technician-only')
  @Roles(UserRole.TECHNICIAN)
  @ApiOperation({
    summary: 'HU-03: Ruta Restringida a Técnicos (@Roles(TECHNICIAN))',
    description: 'Ejemplo de ruta protegida por RBAC restringida al rol TECHNICIAN.',
  })
  @ApiResponse({ status: 200, description: 'Acceso autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  technicianOnly(@CurrentUser() user: any) {
    return {
      message: 'Acceso concedido a zona técnica',
      user,
    };
  }
}
