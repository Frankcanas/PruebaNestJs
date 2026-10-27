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

@ApiTags('Integraciones Externas (EPI-01)')
@Controller('external')
export class ExternalController {
  @Public()
  @UseGuards(ApiKeyGuard)
  @Get('vehicles/:plate/history')
  @ApiOperation({
    summary: 'HU-04: Autenticación para Integraciones Externas mediante API Key',
    description:
      'Endpoint protegido con x-api-key para que socios satélite consulten historial de vehículos.',
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
    description: 'Consulta exitosa por socio externo autorizado',
  })
  @ApiResponse({
    status: 401,
    description: 'API Key inválida o no proporcionada',
  })
  getVehicleHistory(@Param('plate') plate: string) {
    return {
      vehicle: {
        plate,
        status: 'AVAILABLE',
      },
      maintenances: [],
    };
  }
}
