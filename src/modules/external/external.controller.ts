import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiKeyGuard } from '../../common/guards/api-key.guard.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { VehiclesService } from '../vehicles/vehicles.service.js';

@ApiTags('Integraciones Externas (EPI-01 y EPI-06)')
@Controller('external')
export class ExternalController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Public()
  @UseGuards(ApiKeyGuard)
  @Get('vehicles/:plate/history')
  @ApiOperation({
    summary: 'HU-04 y HU-19: Historial de Intervenciones por Vehículo para Socios Externos',
    description:
      'Endpoint protegido con cabecera x-api-key para que socios autorizados consulten vehículo e historial de intervenciones.',
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key del socio externo autorizada en API_KEYS',
    required: true,
  })
  @ApiParam({
    name: 'plate',
    description: 'Placa del vehículo a consultar',
    example: 'ABC123',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de intervenciones obtenido exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'API Key inválida o no proporcionada',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehículo no encontrado',
  })
  async getVehicleHistory(@Param('plate') plate: string) {
    return this.vehiclesService.getHistoryByPlate(plate);
  }
}
