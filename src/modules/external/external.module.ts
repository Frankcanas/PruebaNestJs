import { Module } from '@nestjs/common';
import { ExternalController } from './external.controller.js';
import { ApiKeyGuard } from '../../common/guards/api-key.guard.js';
import { VehiclesModule } from '../vehicles/vehicles.module.js';

@Module({
  imports: [VehiclesModule],
  controllers: [ExternalController],
  providers: [ApiKeyGuard],
})
export class ExternalModule {}
