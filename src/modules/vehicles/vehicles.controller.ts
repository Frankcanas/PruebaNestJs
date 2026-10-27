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
import { VehiclesService } from './vehicles.service.js';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/user-role.enum.js';

@ApiTags('Gestión de Vehículos (EPI-02)')
@ApiBearerAuth()
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'HU-05: Registro y Alta de Nuevos Vehículos en la Flota',
    description:
      'Permite a un Administrador registrar un vehículo con placa única, fijando su estado inicial en AVAILABLE.',
  })
  @ApiResponse({
    status: 201,
    description: 'Vehículo registrado exitosamente con estado AVAILABLE',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o kilometraje negativo',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado (Requiere rol ADMIN)',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un vehículo registrado con la placa indicada',
  })
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @Get()
  @ApiOperation({
    summary: 'HU-06: Consulta de Flota General',
    description:
      'Retorna el listado completo de vehículos registrados incluyendo su estado y kilometraje.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de vehículos obtenido exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  async findAll() {
    return this.vehiclesService.findAll();
  }

  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @Get('plate/:plate')
  @ApiOperation({
    summary: 'HU-06: Búsqueda de Vehículo por Placa',
    description: 'Permite consultar los datos detallados de un vehículo a través de su placa.',
  })
  @ApiParam({
    name: 'plate',
    description: 'Placa del vehículo',
    example: 'ABC123',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehículo encontrado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehículo no encontrado',
  })
  async findByPlate(@Param('plate') plate: string) {
    return this.vehiclesService.findByPlate(plate);
  }

  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @Get(':id')
  @ApiOperation({
    summary: 'HU-06: Consulta Individual de Vehículo por ID',
    description: 'Permite consultar la información completa de un vehículo por su identificador numérico.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador numérico del vehículo',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Vehículo encontrado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehículo no encontrado',
  })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.findById(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({
    summary: 'HU-07: Actualización de Datos de un Vehículo',
    description: 'Permite al Administrador actualizar atributos permitidos de un vehículo existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador numérico del vehículo a actualizar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Vehículo actualizado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado (Requiere rol ADMIN)',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehículo no encontrado',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/inactivate')
  @ApiOperation({
    summary: 'HU-07: Retiro Lógico (Inactivación) de un Vehículo',
    description:
      'Cambia el estado del vehículo a INACTIVE preservando toda su trazabilidad histórica.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador numérico del vehículo a inactivar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Vehículo inactivado exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado (Requiere rol ADMIN)',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehículo no encontrado',
  })
  async inactivate(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.inactivate(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  @ApiOperation({
    summary: 'HU-07: Cambio de Estado de Vehículo',
    description: 'Endpoint alternativo para actualizar estado o inactivar vehículo.',
  })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }
}
