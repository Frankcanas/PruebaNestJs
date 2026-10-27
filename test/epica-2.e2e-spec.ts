import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { AppModule } from '../src/app.module.js';

describe('ÉPICA 2: Gestión del Parque Automotor (Flota de Vehículos)', () => {
  let app: INestApplication;
  let adminToken: string;
  let techToken: string;
  const uniqueId = Date.now();
  let createdVehicleId: number;
  const samplePlate = `ABC${String(uniqueId).slice(-3)}`;

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

    // Crear ADMIN y TECHNICIAN para tokens
    const adminEmail = `admin_e2_${uniqueId}@fleetcore.com`;
    const techEmail = `tech_e2_${uniqueId}@fleetcore.com`;

    await request(app.getHttpServer()).post('/auth/register').send({
      email: adminEmail,
      password: 'Password123!',
      role: 'ADMIN',
    });

    await request(app.getHttpServer()).post('/auth/register').send({
      email: techEmail,
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('HU-05: Registro y Alta de Nuevos Vehículos en la Flota', () => {
    it('Escenario 1: Registro Exitoso de un Vehículo (ADMIN)', async () => {
      const response = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          plate: samplePlate,
          brand: 'Chevrolet',
          model: 'NPR',
          year: 2022,
          mileage: 45000,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.plate).toBe(samplePlate);
      expect(response.body.data.status).toBe('AVAILABLE');
      createdVehicleId = response.body.data.id;
    });

    it('Escenario 2: Intento de Registro con Placa Duplicada', async () => {
      const response = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          plate: samplePlate,
          brand: 'Toyota',
          model: 'Hilux',
          year: 2023,
          mileage: 10000,
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(409);
      expect(response.body.message).toContain('Ya existe un vehículo registrado con la placa indicada');
    });

    it('Escenario 3: Validación de Datos de Entrada (Kilometraje negativo)', async () => {
      const response = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          plate: `NEG${String(uniqueId).slice(-3)}`,
          brand: 'Ford',
          model: 'Cargo',
          year: 2020,
          mileage: -50,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(400);
    });

    it('Denegación de creación por rol no autorizado (TECHNICIAN)', async () => {
      const response = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${techToken}`)
        .send({
          plate: `TEC${String(uniqueId).slice(-3)}`,
          brand: 'Hino',
          model: 'Dutro',
          year: 2021,
          mileage: 30000,
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(403);
    });
  });

  describe('HU-06: Consulta de Flota y Búsqueda de Vehículos por ID o Placa', () => {
    it('Escenario 1: Listado General de Vehículos (Autorizado para ADMIN y TECHNICIAN)', async () => {
      const response = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${techToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('Escenario 2: Consulta Individual por ID Existente', async () => {
      const response = await request(app.getHttpServer())
        .get(`/vehicles/${createdVehicleId}`)
        .set('Authorization', `Bearer ${techToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdVehicleId);
      expect(response.body.data.plate).toBe(samplePlate);
    });

    it('Escenario 2: Consulta Individual por Placa Existente', async () => {
      const response = await request(app.getHttpServer())
        .get(`/vehicles/plate/${samplePlate}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.plate).toBe(samplePlate);
    });

    it('Escenario 3: Vehículo No Encontrado por ID inexistente', async () => {
      const response = await request(app.getHttpServer())
        .get('/vehicles/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toBe('Vehículo no encontrado');
    });

    it('Escenario 3: Vehículo No Encontrado por Placa inexistente', async () => {
      const response = await request(app.getHttpServer())
        .get('/vehicles/plate/NON999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toBe('Vehículo no encontrado');
    });
  });

  describe('HU-07: Actualización de Datos y Retiro Lógico (Inactivación) de Vehículos', () => {
    it('Escenario 1: Actualización Exitosa de Atributos del Vehículo (ADMIN)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/vehicles/${createdVehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          mileage: 48000,
          model: 'NPR Turbo',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.mileage).toBe(48000);
      expect(response.body.data.model).toBe('NPR Turbo');
    });

    it('Escenario 2: Inactivación Lógica de un Vehículo (ADMIN)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/vehicles/${createdVehicleId}/inactivate`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('INACTIVE');
    });

    it('Validar que el vehículo permanece INACTIVE en consultas posteriores', async () => {
      const response = await request(app.getHttpServer())
        .get(`/vehicles/${createdVehicleId}`)
        .set('Authorization', `Bearer ${techToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('INACTIVE');
    });
  });
});
