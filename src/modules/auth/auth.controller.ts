import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UserRole } from '../../common/enums/user-role.enum.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Get('admin-only')
  @Roles(UserRole.ADMIN)
  adminOnly(@CurrentUser() user: any) {
    return {
      message: 'Acceso concedido a zona administrativa',
      user,
    };
  }

  @Get('technician-only')
  @Roles(UserRole.TECHNICIAN)
  technicianOnly(@CurrentUser() user: any) {
    return {
      message: 'Acceso concedido a zona técnica',
      user,
    };
  }
}
