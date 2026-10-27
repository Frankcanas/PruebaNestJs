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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WorkshopsService } from './workshops.service.js';
import { CreateWorkshopDto } from './dto/create-workshop.dto.js';
import { UpdateWorkshopDto } from './dto/update-workshop.dto.js';
import { FilterWorkshopDto } from './dto/filter-workshop.dto.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/user-role.enum.js';

@ApiTags('Gestión de Talleres Mecánicos (EPI-04)')
@ApiBearerAuth()
@Controller('workshops')
export class WorkshopsController {
  constructor(private readonly workshopsService: WorkshopsService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'HU-12: Registro y Alta de Talleres Mecánicos',
    description:
      'Registra un nuevo taller o centro de operación con su nombre y dirección, asignándole estado inicial ACTIVE.',
  })
  @ApiResponse({
    status: 201,
    description: 'Taller registrado exitosamente con estado ACTIVE',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada incompletos o inválidos',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado (Requiere rol ADMIN)',
  })
  async create(@Body() createWorkshopDto: CreateWorkshopDto) {
    return this.workshopsService.create(createWorkshopDto);
  }

  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @Get()
  @ApiOperation({
    summary: 'HU-13: Consulta y Filtrado de Talleres',
    description:
      'Retorna el catálogo de talleres mecánicos con opción de filtrar por estado activo/inactivo (?status=ACTIVE).',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'INACTIVE'],
    description: 'Filtro por estado operativo',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de talleres obtenido exitosamente',
  })
  async findAll(@Query() filterDto: FilterWorkshopDto) {
    return this.workshopsService.findAll(filterDto);
  }

  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @Get('active')
  @ApiOperation({
    summary: 'HU-13: Consulta de Talleres Activos',
    description: 'Ruta dedicada para consultar exclusivamente sedes activas para programar mantenimientos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de talleres activos obtenido exitosamente',
  })
  async findActive() {
    return this.workshopsService.findActive();
  }

  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @Get(':id')
  @ApiOperation({
    summary: 'HU-13: Consulta Individual de Taller por ID',
    description: 'Consulta los datos detallados de una sede física o taller específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del taller mecánico',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Taller encontrado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Taller no encontrado',
  })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.workshopsService.findById(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({
    summary: 'HU-12: Actualización de Datos de un Taller Mecánico',
    description: 'Permite actualizar nombre, dirección o estado de un taller.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del taller',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Taller actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Taller no encontrado',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkshopDto: UpdateWorkshopDto,
  ) {
    return this.workshopsService.update(id, updateWorkshopDto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  @ApiOperation({
    summary: 'HU-12: Activación / Inactivación Lógica de Talleres',
    description: 'Permite activar o inactivar una sede física de mantenimiento.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del taller',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del taller actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Taller no encontrado',
  })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkshopDto: UpdateWorkshopDto,
  ) {
    return this.workshopsService.update(id, updateWorkshopDto);
  }
}
