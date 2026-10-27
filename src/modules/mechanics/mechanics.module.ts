import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mechanic } from './entities/mechanic.entity.js';
import { MechanicsService } from './mechanics.service.js';
import { MechanicsController } from './mechanics.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Mechanic])],
  controllers: [MechanicsController],
  providers: [MechanicsService],
  exports: [MechanicsService, TypeOrmModule],
})
export class MechanicsModule {}
