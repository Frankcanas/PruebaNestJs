import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { AppModule } from '../src/app.module.js';

describe('ÉPICA 4: Gestión de Talleres y Centros de Operación', () => {
  let app: INestApplication;
  let adminToken: string;
  let techToken: string;
  const uniqueId = Date.now();
  let createdWorkshopId: number;

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

    const adminEmail = `admin_e4_${uniqueId}@fleetcore.com`;
    const techEmail = `tech_e4_${uniqueId}@fleetcore.com`;

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

  describe('HU-12: Registro y Administración de Talleres Mecánicos', () => {
    it('Escenario 1: Registro Exitoso de un Taller (ADMIN)', async () => {
      const response = await request(app.getHttpServer())
        .post('/workshops')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Taller Central ${uniqueId}`,
          address: 'Calle 50 # 25-10',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.name).toBe(`Taller Central ${uniqueId}`);
      expect(response.body.data.status).toBe('ACTIVE');
      createdWorkshopId = response.body.data.id;
    });

    it('Validación de campos obligatorios (nombre vacío)', async () => {
      const response = await request(app.getHttpServer())
        .post('/workshops')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '',
          address: 'Calle 50 # 25-10',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(400);
    });

    it('Denegación de creación por rol no autorizado (TECHNICIAN)', async () => {
      const response = await request(app.getHttpServer())
        .post('/workshops')
        .set('Authorization', `Bearer ${techToken}`)
        .send({
          name: 'Taller Denegado',
          address: 'Av. Siempre Viva 123',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(403);
    });

    it('Actualización de datos del taller (ADMIN)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/workshops/${createdWorkshopId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          address: 'Calle 50 # 25-20 Nueva Sede',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.address).toBe('Calle 50 # 25-20 Nueva Sede');
    });

    it('Escenario 2: Inactivación Lógica de un Taller (ADMIN)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/workshops/${createdWorkshopId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'INACTIVE' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('INACTIVE');
    });
  });

  describe('HU-13: Consulta y Filtrado de Talleres Activos', () => {
    let activeWorkshopId: number;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/workshops')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Taller Activo ${uniqueId}`,
          address: 'Diagonal 80 # 10-05',
          status: 'ACTIVE',
        });
      activeWorkshopId = res.body.data.id;
    });

    it('Escenario 1: Listado de Talleres Activos mediante query ?status=ACTIVE', async () => {
      const response = await request(app.getHttpServer())
        .get('/workshops?status=ACTIVE')
        .set('Authorization', `Bearer ${techToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(
        response.body.data.every((w: any) => w.status === 'ACTIVE'),
      ).toBe(true);
    });

    it('Escenario 1: Listado de Talleres Activos mediante endpoint dedicado /active', async () => {
      const response = await request(app.getHttpServer())
        .get('/workshops/active')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(
        response.body.data.every((w: any) => w.status === 'ACTIVE'),
      ).toBe(true);
    });

    it('Escenario 2: Consulta Individual de Taller por ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/workshops/${activeWorkshopId}`)
        .set('Authorization', `Bearer ${techToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(activeWorkshopId);
    });

    it('Escenario 3: Taller Inexistente', async () => {
      const response = await request(app.getHttpServer())
        .get('/workshops/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toBe('Taller no encontrado');
    });
  });
});
