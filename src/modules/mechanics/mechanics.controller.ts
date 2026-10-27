import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MechanicsService } from './mechanics.service.js';
import { CreateMechanicDto } from './dto/create-mechanic.dto.js';
import { UpdateMechanicDto } from './dto/update-mechanic.dto.js';
import { ValidateAvailabilityDto } from './dto/validate-availability.dto.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/user-role.enum.js';

@ApiTags('Gestión de Personal Técnico y Mecánicos (EPI-03)')
@ApiBearerAuth()
@Controller('mechanics')
export class MechanicsController {
  constructor(private readonly mechanicsService: MechanicsService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'HU-08: Registro y Alta de Mecánicos Responsables',
    description:
      'Registra un nuevo mecánico en el sistema con estado inicial ACTIVE y vinculación opcional a un usuario TECHNICIAN.',
  })
  @ApiResponse({
    status: 201,
    description: 'Mecánico registrado exitosamente con estado ACTIVE',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado (Requiere rol ADMIN)',
  })
  @ApiResponse({
    status: 409,
    description: 'El correo del mecánico ya se encuentra registrado',
  })
  async create(@Body() createMechanicDto: CreateMechanicDto) {
    return this.mechanicsService.create(createMechanicDto);
  }

  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @Get()
  @ApiOperation({
    summary: 'HU-09: Consulta General de Mecánicos',
    description: 'Retorna el listado completo de mecánicos registrados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de mecánicos obtenido exitosamente',
  })
  async findAll() {
    return this.mechanicsService.findAll();
  }

  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @Get(':id')
  @ApiOperation({
    summary: 'HU-09: Consulta Individual de Mecánico por ID y Ficha Técnica',
    description: 'Consulta los datos y especialidad de un mecánico específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del mecánico',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Mecánico encontrado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Mecánico no encontrado',
  })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.mechanicsService.findById(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({
    summary: 'HU-10: Actualización de Información de un Mecánico',
    description: 'Permite actualizar datos personales o especialidad del mecánico.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del mecánico a actualizar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Mecánico actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Mecánico no encontrado',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMechanicDto: UpdateMechanicDto,
  ) {
    return this.mechanicsService.update(id, updateMechanicDto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  @ApiOperation({
    summary: 'HU-10: Activación / Inactivación Lógica de Mecánicos',
    description:
      'Actualiza el estado (ACTIVE o INACTIVE) del mecánico preservando íntegro su historial técnico.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del mecánico',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del mecánico actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Mecánico no encontrado',
  })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMechanicDto: UpdateMechanicDto,
  ) {
    return this.mechanicsService.update(id, updateMechanicDto);
  }

  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @Post(':id/validate-availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'HU-11: Control de Disponibilidad y Validación de Horarios',
    description:
      'Verifica que el mecánico esté en estado ACTIVE y disponible para la fecha y rango de tiempo solicitado.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del mecánico a validar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Mecánico disponible para el horario solicitado',
  })
  @ApiResponse({
    status: 409,
    description: 'El mecánico está inactivo o presenta conflicto de horarios',
  })
  async validateAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ValidateAvailabilityDto,
  ) {
    return this.mechanicsService.validateAvailability(id, dto);
  }
}
