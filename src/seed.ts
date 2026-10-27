import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './modules/auth/entities/user.entity.js';
import { UserRole } from './common/enums/user-role.enum.js';
import { Mechanic } from './modules/mechanics/entities/mechanic.entity.js';
import { MechanicStatus } from './common/enums/mechanic-status.enum.js';
import { Workshop } from './modules/workshops/entities/workshop.entity.js';
import { WorkshopStatus } from './common/enums/workshop-status.enum.js';
import { Vehicle } from './modules/vehicles/entities/vehicle.entity.js';
import { VehicleStatus } from './common/enums/vehicle-status.enum.js';
import { Maintenance } from './modules/maintenances/entities/maintenance.entity.js';
import { MaintenanceStatus } from './common/enums/maintenance-status.enum.js';
import { MaintenanceType } from './common/enums/maintenance-type.enum.js';

export async function runSeeder(silent = false) {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'fleetcore',
    entities: [User, Mechanic, Workshop, Vehicle, Maintenance],
    synchronize: true,
  });

  await dataSource.initialize();
  if (!silent) console.log('✓ Conexión establecida para Seeder idempotente.');

  const userRepo = dataSource.getRepository(User);
  const mechRepo = dataSource.getRepository(Mechanic);
  const wsRepo = dataSource.getRepository(Workshop);
  const vehRepo = dataSource.getRepository(Vehicle);
  const maintRepo = dataSource.getRepository(Maintenance);

  // 1. Usuarios del Sistema (1 ADMIN, 2 TECHNICIAN)
  const defaultPassword = await bcrypt.hash('FleetCore2026!', 10);

  let admin = await userRepo.findOne({ where: { email: 'admin@fleetcore.com' } });
  if (!admin) {
    admin = userRepo.create({
      email: 'admin@fleetcore.com',
      password: defaultPassword,
      role: UserRole.ADMIN,
    });
    await userRepo.save(admin);
  }

  let tech1 = await userRepo.findOne({ where: { email: 'tecnico1@fleetcore.com' } });
  if (!tech1) {
    tech1 = userRepo.create({
      email: 'tecnico1@fleetcore.com',
      password: defaultPassword,
      role: UserRole.TECHNICIAN,
    });
    await userRepo.save(tech1);
  }

  let tech2 = await userRepo.findOne({ where: { email: 'tecnico2@fleetcore.com' } });
  if (!tech2) {
    tech2 = userRepo.create({
      email: 'tecnico2@fleetcore.com',
      password: defaultPassword,
      role: UserRole.TECHNICIAN,
    });
    await userRepo.save(tech2);
  }

  // 2. Talleres (1 activo, 1 inactivo)
  let wsActive = await wsRepo.findOne({ where: { name: 'Taller Central Norte' } });
  if (!wsActive) {
    wsActive = wsRepo.create({
      name: 'Taller Central Norte',
      address: 'Av. Industrial 45 # 12-30',
      status: WorkshopStatus.ACTIVE,
    });
    await wsRepo.save(wsActive);
  } else {
    wsActive.status = WorkshopStatus.ACTIVE;
    await wsRepo.save(wsActive);
  }

  let wsInactive = await wsRepo.findOne({ where: { name: 'Taller Sur Histórico' } });
  if (!wsInactive) {
    wsInactive = wsRepo.create({
      name: 'Taller Sur Histórico',
      address: 'Calle 80 Sur # 10-20',
      status: WorkshopStatus.INACTIVE,
    });
    await wsRepo.save(wsInactive);
  } else {
    wsInactive.status = WorkshopStatus.INACTIVE;
    await wsRepo.save(wsInactive);
  }

  // 3. Mecánicos (2 activos vinculados a los técnicos, 1 inactivo)
  let m1 = await mechRepo.findOne({ where: { email: 'carlos.perez@fleetcore.com' } });
  if (!m1) {
    m1 = mechRepo.create({
      name: 'Carlos Pérez',
      email: 'carlos.perez@fleetcore.com',
      specialty: 'Frenos y Suspensión',
      status: MechanicStatus.ACTIVE,
      userId: tech1.id,
    });
    await mechRepo.save(m1);
  } else {
    m1.userId = tech1.id;
    m1.status = MechanicStatus.ACTIVE;
    await mechRepo.save(m1);
  }

  let m2 = await mechRepo.findOne({ where: { email: 'andres.gomez@fleetcore.com' } });
  if (!m2) {
    m2 = mechRepo.create({
      name: 'Andrés Gómez',
      email: 'andres.gomez@fleetcore.com',
      specialty: 'Motor Diésel',
      status: MechanicStatus.ACTIVE,
      userId: tech2.id,
    });
    await mechRepo.save(m2);
  } else {
    m2.userId = tech2.id;
    m2.status = MechanicStatus.ACTIVE;
    await mechRepo.save(m2);
  }

  let m3 = await mechRepo.findOne({ where: { email: 'mario.castro@fleetcore.com' } });
  if (!m3) {
    m3 = mechRepo.create({
      name: 'Mario Castro',
      email: 'mario.castro@fleetcore.com',
      specialty: 'Sistemas Eléctricos',
      status: MechanicStatus.INACTIVE,
    });
    await mechRepo.save(m3);
  } else {
    m3.status = MechanicStatus.INACTIVE;
    await mechRepo.save(m3);
  }

  // 4. Vehículos (2 AVAILABLE, 1 IN_MAINTENANCE, 1 INACTIVE)
  let v1 = await vehRepo.findOne({ where: { plate: 'ABC123' } });
  if (!v1) {
    v1 = vehRepo.create({
      plate: 'ABC123',
      brand: 'Chevrolet',
      model: 'NPR',
      year: 2022,
      mileage: 45000,
      status: VehicleStatus.AVAILABLE,
    });
    await vehRepo.save(v1);
  }

  let v2 = await vehRepo.findOne({ where: { plate: 'DEF456' } });
  if (!v2) {
    v2 = vehRepo.create({
      plate: 'DEF456',
      brand: 'Hino',
      model: 'Dutro',
      year: 2021,
      mileage: 60000,
      status: VehicleStatus.AVAILABLE,
    });
    await vehRepo.save(v2);
  }

  let v3 = await vehRepo.findOne({ where: { plate: 'GHI789' } });
  if (!v3) {
    v3 = vehRepo.create({
      plate: 'GHI789',
      brand: 'Kenworth',
      model: 'T800',
      year: 2020,
      mileage: 85000,
      status: VehicleStatus.IN_MAINTENANCE,
    });
    await vehRepo.save(v3);
  } else {
    v3.status = VehicleStatus.IN_MAINTENANCE;
    await vehRepo.save(v3);
  }

  let v4 = await vehRepo.findOne({ where: { plate: 'JKL012' } });
  if (!v4) {
    v4 = vehRepo.create({
      plate: 'JKL012',
      brand: 'Ford',
      model: 'Cargo',
      year: 2018,
      mileage: 150000,
      status: VehicleStatus.INACTIVE,
    });
    await vehRepo.save(v4);
  } else {
    v4.status = VehicleStatus.INACTIVE;
    await vehRepo.save(v4);
  }

  // 5. Mantenimientos (al menos 1 COMPLETED y 1 IN_PROGRESS)
  let maintCompleted = await maintRepo.findOne({
    where: {
      vehicleId: v1.id,
      status: MaintenanceStatus.COMPLETED,
    },
  });
  if (!maintCompleted) {
    maintCompleted = maintRepo.create({
      type: MaintenanceType.PREVENTIVE,
      status: MaintenanceStatus.COMPLETED,
      description: 'Cambio de aceite y filtros',
      mileage: 45000,
      cost: 350000,
      scheduledDate: new Date('2026-09-15T16:30:00.000Z'),
      finishedAt: new Date('2026-09-15T18:30:00.000Z'),
      workDone: 'Cambio de aceite y filtros realizado con éxito',
      vehicleId: v1.id,
      mechanicId: m1.id,
      workshopId: wsActive.id,
    });
    await maintRepo.save(maintCompleted);
  }

  let maintInProgress = await maintRepo.findOne({
    where: {
      vehicleId: v3.id,
      status: MaintenanceStatus.IN_PROGRESS,
    },
  });
  if (!maintInProgress) {
    maintInProgress = maintRepo.create({
      type: MaintenanceType.CORRECTIVE,
      status: MaintenanceStatus.IN_PROGRESS,
      description: 'Reparación de inyectores y sistema de combustible',
      mileage: 85000,
      scheduledDate: new Date('2026-10-20T08:00:00.000Z'),
      vehicleId: v3.id,
      mechanicId: m2.id,
      workshopId: wsActive.id,
    });
    await maintRepo.save(maintInProgress);
  }

  if (!silent) {
    console.log('✓ Seeder idempotente completado exitosamente.');
    console.log('  - Usuarios:', await userRepo.count());
    console.log('  - Mecánicos:', await mechRepo.count());
    console.log('  - Talleres:', await wsRepo.count());
    console.log('  - Vehículos:', await vehRepo.count());
    console.log('  - Mantenimientos:', await maintRepo.count());
  }

  await dataSource.destroy();
}

if (process.argv[1]?.endsWith('seed.js') || process.argv[1]?.endsWith('seed.ts')) {
  runSeeder()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error ejecutando seeder:', err);
      process.exit(1);
    });
}
