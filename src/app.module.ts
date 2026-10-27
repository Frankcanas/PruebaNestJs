import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module.js';
import { ExternalModule } from './modules/external/external.module.js';
import { VehiclesModule } from './modules/vehicles/vehicles.module.js';
import { MechanicsModule } from './modules/mechanics/mechanics.module.js';
import { WorkshopsModule } from './modules/workshops/workshops.module.js';
import { MaintenancesModule } from './modules/maintenances/maintenances.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { User } from './modules/auth/entities/user.entity.js';
import { Vehicle } from './modules/vehicles/entities/vehicle.entity.js';
import { Mechanic } from './modules/mechanics/entities/mechanic.entity.js';
import { Workshop } from './modules/workshops/entities/workshop.entity.js';
import { Maintenance } from './modules/maintenances/entities/maintenance.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'fleetcore'),
        entities: [User, Vehicle, Mechanic, Workshop, Maintenance],
        synchronize: true,
      }),
    }),
    AuthModule,
    ExternalModule,
    VehiclesModule,
    MechanicsModule,
    WorkshopsModule,
    MaintenancesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
