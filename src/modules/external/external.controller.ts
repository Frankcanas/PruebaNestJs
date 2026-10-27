import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../common/guards/api-key.guard.js';
import { Public } from '../../common/decorators/public.decorator.js';

@Controller('external')
export class ExternalController {
  @Public()
  @UseGuards(ApiKeyGuard)
  @Get('vehicles/:plate/history')
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
