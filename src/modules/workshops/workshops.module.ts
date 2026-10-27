import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workshop } from './entities/workshop.entity.js';
import { WorkshopsService } from './workshops.service.js';
import { WorkshopsController } from './workshops.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Workshop])],
  controllers: [WorkshopsController],
  providers: [WorkshopsService],
  exports: [WorkshopsService, TypeOrmModule],
})
export class WorkshopsModule {}
