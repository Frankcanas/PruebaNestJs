import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { AppModule } from '../src/app.module.js';

describe('ÉPICA 5: Planificación, Ejecución y Ciclo de Vida de Mantenimientos', () => {
  let app: INestApplication;
  let adminToken: string;
  let techToken: string;
  let otherTechToken: string;
  let techUserId: number;

  const uniqueId = Date.now();
  let vehicleId: number;
  let vehiclePlate: string;
  let mechanicId: number;
  let workshopId: number;
  let inactiveWorkshopId: number;
  let inactiveMechanicId: number;
  let maintenanceId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // 1. Crear usuarios ADMIN y TECHNICIAN
    const adminEmail = `admin_e5_${uniqueId}@fleetcore.com`;
    const techEmail = `tech_e5_${uniqueId}@fleetcore.com`;
    const otherTechEmail = `other_tech_e5_${uniqueId}@fleetcore.com`;

    await request(app.getHttpServer()).post('/auth/register').send({
      email: adminEmail,
      password: 'Password123!',
      role: 'ADMIN',
    });

    const regTech = await request(app.getHttpServer()).post('/auth/register').send({
      email: techEmail,
      password: 'Password123!',
      role: 'TECHNICIAN',
    });
    techUserId = regTech.body.data.id;

    await request(app.getHttpServer()).post('/auth/register').send({
      email: otherTechEmail,
      password: 'Password123!',
      role: 'TECHNICIAN',
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password: 'Password123!' });
    adminToken = adminLogin.body.data.accessToken;

    const techLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: techEmail, password: 'Password123!' });
    techToken = techLogin.body.data.accessToken;

    const otherTechLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: otherTechEmail, password: 'Password123!' });
    otherTechToken = otherTechLogin.body.data.accessToken;

    // 2. Crear vehículo base
    vehiclePlate = `MNT${String(uniqueId).slice(-3)}`;
    const vehRes = await request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        plate: vehiclePlate,
        brand: 'Chevrolet',
        model: 'FTR',
        year: 2021,
        mileage: 50000,
      });
    vehicleId = vehRes.body.data.id;

    // 3. Crear mecánico vinculado a techUserId
    const mechRes = await request(app.getHttpServer())
      .post('/mechanics')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Mecánico Asignado ${uniqueId}`,
        email: `tech_mech_${uniqueId}@fleetcore.com`,
        specialty: 'Motor y Frenos',
        userId: techUserId,
      });
    mechanicId = mechRes.body.data.id;

    // 4. Crear mecánico inactivo
    const inactMechRes = await request(app.getHttpServer())
      .post('/mechanics')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Mecánico Inactivo ${uniqueId}`,
        email: `inact_mech_${uniqueId}@fleetcore.com`,
        specialty: 'General',
      });
    inactiveMechanicId = inactMechRes.body.data.id;
    await request(app.getHttpServer())
      .patch(`/mechanics/${inactiveMechanicId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'INACTIVE' });

    // 5. Crear taller activo y taller inactivo
    const wsRes = await request(app.getHttpServer())
      .post('/workshops')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Taller Principal ${uniqueId}`,
        address: 'Calle 10 # 20-30',
      });
    workshopId = wsRes.body.data.id;

    const inactWsRes = await request(app.getHttpServer())
      .post('/workshops')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Taller Deshabilitado ${uniqueId}`,
        address: 'Calle 0 # 0-0',
        status: 'INACTIVE',
      });
    inactiveWorkshopId = inactWsRes.body.data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('HU-14: Creación y Programación de Mantenimiento Preventivo o Correctivo', () => {
    it('Escenario 1: Creación Exitosa de Mantenimiento Programado (SCHEDULED)', async () => {
      const response = await request(app.getHttpServer())
        .post('/maintenances')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'PREVENTIVE',
          description: 'Mantenimiento de 50,000 km y cambio de filtros',
          mileage: 50000,
          scheduledDate: '2026-11-10T08:00:00.000Z',
          vehicleId,
          mechanicId,
          workshopId,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.status).toBe('SCHEDULED');
      expect(response.body.data.vehicle.id).toBe(vehicleId);
      expect(response.body.data.mechanic.id).toBe(mechanicId);
      expect(response.body.data.workshop.id).toBe(workshopId);

      maintenanceId = response.body.data.id;
    });

    it('Escenario 2: Rechazo por Vehículo con Mantenimiento Activo Previo', async () => {
      const response = await request(app.getHttpServer())
        .post('/maintenances')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'CORRECTIVE',
          description: 'Segundo intento mientras está SCHEDULED',
          mileage: 50000,
          scheduledDate: '2026-11-12T08:00:00.000Z',
          vehicleId,
          mechanicId,
          workshopId,
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(409);
      expect(response.body.message).toContain(`El vehículo ${vehiclePlate} ya tiene un mantenimiento activo`);
    });

    it('Escenario 3: Rechazo por Kilometraje Inferior al Actual del Vehículo', async () => {
      // Crear segundo vehículo con 60,000 km
      const v2Res = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          plate: `KM${String(uniqueId).slice(-4)}`,
          brand: 'Kenworth',
          model: 'T800',
          year: 2022,
          mileage: 60000,
        });
      const v2Id = v2Res.body.data.id;

      const response = await request(app.getHttpServer())
        .post('/maintenances')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'PREVENTIVE',
          description: 'Kilometraje inferior inválido',
          mileage: 55000, // < 60,000 km
          scheduledDate: '2026-11-15T08:00:00.000Z',
          vehicleId: v2Id,
          mechanicId,
          workshopId,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toContain('El kilometraje registrado no podrá ser inferior al kilometraje actual');
    });

    it('Escenario 4: Rechazo por Mecánico o Taller Inactivo', async () => {
      const v3Res = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          plate: `IN${String(uniqueId).slice(-4)}`,
          brand: 'Volvo',
          model: 'FH',
          year: 2023,
          mileage: 20000,
        });

      const responseInactMech = await request(app.getHttpServer())
        .post('/maintenances')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'PREVENTIVE',
          description: 'Asignar a mecánico inactivo',
          mileage: 20000,
          scheduledDate: '2026-11-20T08:00:00.000Z',
          vehicleId: v3Res.body.data.id,
          mechanicId: inactiveMechanicId,
          workshopId,
        });

      expect(responseInactMech.status).toBe(400);
      expect(responseInactMech.body.message).toContain('No se puede asignar un mantenimiento a un mecánico inactivo');

      const responseInactWs = await request(app.getHttpServer())
        .post('/maintenances')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'PREVENTIVE',
          description: 'Asignar a taller inactivo',
          mileage: 20000,
          scheduledDate: '2026-11-20T08:00:00.000Z',
          vehicleId: v3Res.body.data.id,
          mechanicId,
          workshopId: inactiveWorkshopId,
        });

      expect(responseInactWs.status).toBe(400);
      expect(responseInactWs.body.message).toContain('No se puede asignar un mantenimiento a un taller inactivo');
    });
  });

  describe('HU-15: Inicio de Mantenimiento y Transición Automática a IN_MAINTENANCE', () => {
    it('Escenario 2: Restricción de Permisos para Técnico No Asignado', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/maintenances/${maintenanceId}/status`)
        .set('Authorization', `Bearer ${otherTechToken}`)
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(403);
      expect(response.body.message).toContain('Solo puedes operar sobre los mantenimientos que tengas asignados');
    });

    it('Escenario 1: Transición Exitosa a IN_PROGRESS con Sincronización del Vehículo a IN_MAINTENANCE', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/maintenances/${maintenanceId}/status`)
        .set('Authorization', `Bearer ${techToken}`)
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('IN_PROGRESS');

      // Verificar que el vehículo pasó a IN_MAINTENANCE
      const vehResponse = await request(app.getHttpServer())
        .get(`/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${techToken}`);

      expect(vehResponse.body.data.status).toBe('IN_MAINTENANCE');
    });
  });

  describe('HU-16: Finalización y Cierre de Mantenimiento con Liquidación Técnica', () => {
    it('Escenario 2: Rechazo por Información de Cierre Incompleta', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/maintenances/${maintenanceId}/complete`)
        .set('Authorization', `Bearer ${techToken}`)
        .send({
          // Falta workDone y cost
          mileage: 50500,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(400);
    });

    it('Escenario 1: Cierre Exitoso con Datos Completos y Vehículo retorna a AVAILABLE', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/maintenances/${maintenanceId}/complete`)
        .set('Authorization', `Bearer ${techToken}`)
        .send({
          workDone: 'Cambio de aceite motor y filtros de aire completados satisfactoriamente',
          cost: 320000,
          finishedAt: '2026-11-10T14:00:00.000Z',
          mileage: 50500,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('COMPLETED');
      expect(response.body.data.workDone).toBeDefined();
      expect(response.body.data.finishedAt).toBeDefined();

      // Verificar que el vehículo volvió a AVAILABLE y sincronizó odómetro
      const vehResponse = await request(app.getHttpServer())
        .get(`/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${techToken}`);

      expect(vehResponse.body.data.status).toBe('AVAILABLE');
      expect(vehResponse.body.data.mileage).toBe(50500);
    });

    it('Escenario 3: Irreversibilidad del Estado COMPLETED', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/maintenances/${maintenanceId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(409);
      expect(response.body.message).toContain('Un mantenimiento COMPLETED no podrá regresar a un estado anterior');
    });
  });

  describe('HU-17: Cancelación de Mantenimiento y Blindaje de Máquina de Estados', () => {
    let cancelableMaintId: number;
    let cancelableVehId: number;

    beforeAll(async () => {
      const vRes = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          plate: `CN${String(uniqueId).slice(-4)}`,
          brand: 'Mercedes',
          model: 'Actros',
          year: 2022,
          mileage: 35000,
        });
      cancelableVehId = vRes.body.data.id;

      const mRes = await request(app.getHttpServer())
        .post('/maintenances')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'CORRECTIVE',
          description: 'Mantenimiento a ser cancelado',
          mileage: 35000,
          scheduledDate: '2026-11-25T08:00:00.000Z',
          vehicleId: cancelableVehId,
          mechanicId,
          workshopId,
        });
      cancelableMaintId = mRes.body.data.id;

      // Iniciar mantenimiento (pasa vehículo a IN_MAINTENANCE)
      await request(app.getHttpServer())
        .patch(`/maintenances/${cancelableMaintId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'IN_PROGRESS' });
    });

    it('Escenario 1: Cancelación Exitosa y Liberación de Vehículo a AVAILABLE (ADMIN)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/maintenances/${cancelableMaintId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'CANCELLED',
          cancellationReason: 'Repuestos fuera de catálogo',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('CANCELLED');

      // Validar que el vehículo volvió a AVAILABLE
      const vehResponse = await request(app.getHttpServer())
        .get(`/vehicles/${cancelableVehId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(vehResponse.body.data.status).toBe('AVAILABLE');
    });

    it('Escenario 2: Prohibición de Reactivación de Mantenimiento CANCELLED', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/maintenances/${cancelableMaintId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(409);
      expect(response.body.message).toContain('Un mantenimiento CANCELLED no podrá posteriormente cambiar a IN_PROGRESS o COMPLETED');
    });

    it('Escenario 3: Transición Inválida Directa (SCHEDULED directamente a COMPLETED sin iniciar)', async () => {
      // Crear nuevo mantenimiento SCHEDULED
      const newMRes = await request(app.getHttpServer())
        .post('/maintenances')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'PREVENTIVE',
          description: 'Intento de transición inválida directa',
          mileage: 35000,
          scheduledDate: '2026-11-28T08:00:00.000Z',
          vehicleId: cancelableVehId,
          mechanicId,
          workshopId,
        });

      const response = await request(app.getHttpServer())
        .patch(`/maintenances/${newMRes.body.data.id}/complete`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          workDone: 'Intento directo',
          cost: 1000,
          finishedAt: '2026-11-28T10:00:00.000Z',
          mileage: 35000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toContain('debe estar en estado IN_PROGRESS para poder ser completado');
    });
  });
});
