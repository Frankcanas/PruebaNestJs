import { Module } from '@nestjs/common';
import { ExternalController } from './external.controller.js';
import { ApiKeyGuard } from '../../common/guards/api-key.guard.js';

@Module({
  controllers: [ExternalController],
  providers: [ApiKeyGuard],
})
export class ExternalModule {}
