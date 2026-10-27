import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { AppModule } from '../src/app.module.js';

describe('ÉPICA 6: Trazabilidad, Historiales e Integración de Socios Externos', () => {
  let app: INestApplication;
  let adminToken: string;
  let techToken: string;
  const uniqueId = Date.now();
  let vehicleId: number;
  let vehiclePlate: string;
  let mechanicId: number;
  let workshopId: number;
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

    // 1. Usuarios
    const adminEmail = `admin_e6_${uniqueId}@fleetcore.com`;
    const techEmail = `tech_e6_${uniqueId}@fleetcore.com`;

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
    const techUserId = regTech.body.data.id;

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password: 'Password123!' });
    adminToken = adminLogin.body.data.accessToken;

    const techLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: techEmail, password: 'Password123!' });
    techToken = techLogin.body.data.accessToken;

    // 2. Vehículo
    vehiclePlate = `HIS${String(uniqueId).slice(-3)}`;
    const vehRes = await request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        plate: vehiclePlate,
        brand: 'Chevrolet',
        model: 'NPR',
        year: 2022,
        mileage: 40000,
      });
    vehicleId = vehRes.body.data.id;

    // 3. Mecánico
    const mechRes = await request(app.getHttpServer())
      .post('/mechanics')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Mecánico Historial ${uniqueId}`,
        email: `mech_his_${uniqueId}@fleetcore.com`,
        specialty: 'Frenos',
        userId: techUserId,
      });
    mechanicId = mechRes.body.data.id;

    // 4. Taller
    const wsRes = await request(app.getHttpServer())
      .post('/workshops')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Taller Historial ${uniqueId}`,
        address: 'Carrera 70 # 45-12',
      });
    workshopId = wsRes.body.data.id;

    // 5. Crear mantenimiento y completarlo para tener historial
    const mRes = await request(app.getHttpServer())
      .post('/maintenances')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        type: 'PREVENTIVE',
        description: 'Revisión y cambio de aceite de frenos',
        mileage: 40000,
        scheduledDate: '2026-11-01T08:00:00.000Z',
        vehicleId,
        mechanicId,
        workshopId,
      });
    maintenanceId = mRes.body.data.id;

    // Pasar a IN_PROGRESS
    await request(app.getHttpServer())
      .patch(`/maintenances/${maintenanceId}/status`)
      .set('Authorization', `Bearer ${techToken}`)
      .send({ status: 'IN_PROGRESS' });

    // Completar
    await request(app.getHttpServer())
      .patch(`/maintenances/${maintenanceId}/complete`)
      .set('Authorization', `Bearer ${techToken}`)
      .send({
        workDone: 'Cambio de pastillas y purga de líquido de frenos',
        cost: 250000,
        finishedAt: '2026-11-01T11:00:00.000Z',
        mileage: 40100,
      });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('HU-18: Consulta y Monitoreo de Mantenimientos por Rol (Admin vs Técnico)', () => {
    it('Escenario 1: Consulta Global de Mantenimientos por Administrador con filtros', async () => {
      const response = await request(app.getHttpServer())
        .get(`/maintenances?vehicleId=${vehicleId}&status=COMPLETED`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].vehicle.id).toBe(vehicleId);
      expect(response.body.data[0].mechanic.id).toBe(mechanicId);
      expect(response.body.data[0].workshop.id).toBe(workshopId);
    });

    it('Escenario 2: Consulta de Agenda del Técnico Autenticado (/my-assigned)', async () => {
      const response = await request(app.getHttpServer())
        .get('/maintenances/my-assigned')
        .set('Authorization', `Bearer ${techToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(
        response.body.data.every((m: any) => m.mechanicId === mechanicId),
      ).toBe(true);
    });

    it('Escenario 3: Filtro de Mantenimientos Activos (/active)', async () => {
      const response = await request(app.getHttpServer())
        .get('/maintenances/active')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(
        response.body.data.every(
          (m: any) => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS',
        ),
      ).toBe(true);
    });
  });

  describe('HU-19: Historial de Intervenciones por Vehículo y Consulta para Socios Externos', () => {
    it('Escenario 1: Consulta de Historial vía Integración Externa con x-api-key Válida', async () => {
      const response = await request(app.getHttpServer())
        .get(`/external/vehicles/${vehiclePlate}/history`)
        .set('x-api-key', 'demo-key-partner-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.vehicle).toBeDefined();
      expect(response.body.data.vehicle.plate).toBe(vehiclePlate);
      expect(response.body.data.maintenances).toBeDefined();
      expect(Array.isArray(response.body.data.maintenances)).toBe(true);
      expect(response.body.data.maintenances.length).toBeGreaterThanOrEqual(1);

      const m = response.body.data.maintenances[0];
      expect(m.id).toBe(maintenanceId);
      expect(m.status).toBe('COMPLETED');
      expect(m.workDone).toBeDefined();
      expect(m.cost).toBeDefined();
      expect(m.mechanic).toBeDefined();
      expect(m.workshop).toBeDefined();
    });

    it('Escenario 2: Consulta Interna de Historial (/vehicles/:id/history)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/vehicles/${vehicleId}/history`)
        .set('Authorization', `Bearer ${techToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.vehicle.id).toBe(vehicleId);
      expect(response.body.data.maintenances.length).toBeGreaterThanOrEqual(1);
    });

    it('Escenario 3: Consulta de Placa Inexistente por Socio Externo', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/vehicles/NOTFOUND/history')
        .set('x-api-key', 'demo-key-partner-1');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toBe('Vehículo no encontrado');
    });

    it('Escenario 4: Consulta Interna de Vehículo Inexistente', async () => {
      const response = await request(app.getHttpServer())
        .get('/vehicles/999999/history')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toBe('Vehículo no encontrado');
    });
  });
});
