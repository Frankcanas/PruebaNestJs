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
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MaintenancesService } from './maintenances.service.js';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto.js';
import { UpdateMaintenanceStatusDto } from './dto/update-status.dto.js';
import { CompleteMaintenanceDto } from './dto/complete-maintenance.dto.js';
import { FilterMaintenanceDto } from './dto/filter-maintenance.dto.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UserRole } from '../../common/enums/user-role.enum.js';

@ApiTags('Ciclo de Vida de Mantenimientos (EPI-05)')
@ApiBearerAuth()
@Controller('maintenances')
export class MaintenancesController {
  constructor(private readonly maintenancesService: MaintenancesService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'HU-14: Creación y Programación de Mantenimiento',
    description:
      'Programa un mantenimiento preventivo o correctivo vinculando vehículo, mecánico y taller con estado SCHEDULED.',
  })
  @ApiResponse({
    status: 201,
    description: 'Mantenimiento programado exitosamente con estado inicial SCHEDULED',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos, kilometraje menor al actual, o vehículo/mecánico/taller inactivo',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehículo, mecánico o taller no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Vehículo con mantenimiento activo previo o cruce de horarios de mecánico',
  })
  async create(@Body() createDto: CreateMaintenanceDto) {
    return this.maintenancesService.create(createDto);
  }

  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @Get()
  @ApiOperation({
    summary: 'Consulta General de Mantenimientos con Filtros',
    description: 'Permite consultar mantenimientos aplicando filtros por status, vehicleId o mechanicId.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de mantenimientos obtenido exitosamente',
  })
  async findAll(@Query() filterDto: FilterMaintenanceDto) {
    return this.maintenancesService.findAll(filterDto);
  }

  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @Get('active')
  @ApiOperation({
    summary: 'Consulta de Mantenimientos Activos',
    description: 'Retorna mantenimientos en estado SCHEDULED o IN_PROGRESS.',
  })
  @ApiResponse({
    status: 200,
    description: 'Mantenimientos activos obtenidos exitosamente',
  })
  async findActive() {
    return this.maintenancesService.findActive();
  }

  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @Get('my-assigned')
  @ApiOperation({
    summary: 'Consulta de Agenda y Mantenimientos Asignados al Técnico',
    description: 'Retorna la lista de intervenciones asignadas al técnico autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Mantenimientos asignados obtenidos exitosamente',
  })
  async findMyAssigned(@CurrentUser() user: any) {
    return this.maintenancesService.findMyAssigned(user);
  }

  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @Get(':id')
  @ApiOperation({
    summary: 'Consulta Individual de Mantenimiento por ID',
    description: 'Retorna los detalles técnicos del mantenimiento con relaciones pobladas.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del mantenimiento',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Mantenimiento encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Mantenimiento no encontrado',
  })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.maintenancesService.findById(id);
  }

  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @Patch(':id/status')
  @ApiOperation({
    summary: 'HU-15 y HU-17: Transición de Estado de Mantenimiento (IN_PROGRESS o CANCELLED)',
    description:
      'Inicia el mantenimiento (transición a IN_PROGRESS y sincroniza vehículo a IN_MAINTENANCE) o cancela (transición a CANCELLED y libera vehículo a AVAILABLE).',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del mantenimiento',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Transición de estado ejecutada con sincronización atómica del vehículo',
  })
  @ApiResponse({
    status: 400,
    description: 'Transición de estado no permitida o faltan datos requeridos',
  })
  @ApiResponse({
    status: 403,
    description: 'Técnico no autorizado para modificar mantenimientos no asignados',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto de máquina de estados (irreversibilidad de COMPLETED o CANCELLED)',
  })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMaintenanceStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.maintenancesService.updateStatus(id, dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @Patch(':id/complete')
  @ApiOperation({
    summary: 'HU-16: Finalización y Cierre de Mantenimiento con Liquidación Técnica',
    description:
      'Cierra formalmente un mantenimiento en IN_PROGRESS registrando trabajo, costo, fecha y kilometraje, y libera el vehículo a AVAILABLE.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del mantenimiento a completar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Mantenimiento completado y liquidado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Información obligatoria de cierre incompleta o no se encuentra en IN_PROGRESS',
  })
  @ApiResponse({
    status: 403,
    description: 'Permisos insuficientes para modificar esta orden',
  })
  @ApiResponse({
    status: 409,
    description: 'El mantenimiento ya se encuentra en estado terminal COMPLETED o CANCELLED',
  })
  async complete(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CompleteMaintenanceDto,
    @CurrentUser() user: any,
  ) {
    return this.maintenancesService.complete(id, dto, user);
  }
}
