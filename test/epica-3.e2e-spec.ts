import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { AppModule } from '../src/app.module.js';

describe('ÉPICA 3: Gestión de Personal Técnico y Mecánicos', () => {
  let app: INestApplication;
  let adminToken: string;
  let techToken: string;
  const uniqueId = Date.now();
  let createdMechanicId: number;
  const sampleEmail = `carlos_${uniqueId}@fleetcore.com`;

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

    const adminEmail = `admin_e3_${uniqueId}@fleetcore.com`;
    const techEmail = `tech_e3_${uniqueId}@fleetcore.com`;

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

  describe('HU-08: Registro y Alta de Mecánicos Responsables', () => {
    it('Escenario 1: Registro Exitoso de un Mecánico (ADMIN)', async () => {
      const response = await request(app.getHttpServer())
        .post('/mechanics')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Carlos Pérez',
          email: sampleEmail,
          specialty: 'Frenos y Suspensión',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.name).toBe('Carlos Pérez');
      expect(response.body.data.status).toBe('ACTIVE');
      createdMechanicId = response.body.data.id;
    });

    it('Escenario 2: Correo de Mecánico Duplicado', async () => {
      const response = await request(app.getHttpServer())
        .post('/mechanics')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Carlos Duplicate',
          email: sampleEmail,
          specialty: 'Motor',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(409);
      expect(response.body.message).toContain('El correo del mecánico ya se encuentra registrado');
    });

    it('Denegación de creación por rol no autorizado (TECHNICIAN)', async () => {
      const response = await request(app.getHttpServer())
        .post('/mechanics')
        .set('Authorization', `Bearer ${techToken}`)
        .send({
          name: 'Mecánico Denegado',
          email: `denied_${uniqueId}@fleetcore.com`,
          specialty: 'Electricidad',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(403);
    });
  });

  describe('HU-09: Consulta de Mecánicos Registrados y Ficha Técnica Individual', () => {
    it('Escenario 1: Consulta General de Mecánicos', async () => {
      const response = await request(app.getHttpServer())
        .get('/mechanics')
        .set('Authorization', `Bearer ${techToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('Escenario 2: Consulta Individual por ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/mechanics/${createdMechanicId}`)
        .set('Authorization', `Bearer ${techToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdMechanicId);
      expect(response.body.data.name).toBe('Carlos Pérez');
    });

    it('Escenario 3: Mecánico Inexistente', async () => {
      const response = await request(app.getHttpServer())
        .get('/mechanics/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toBe('Mecánico no encontrado');
    });
  });

  describe('HU-10: Activación e Inactivación Lógica de Mecánicos y Preservación Histórica', () => {
    it('Actualización de Especialidad de un Mecánico', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/mechanics/${createdMechanicId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          specialty: 'Diagnóstico Electrónico',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.specialty).toBe('Diagnóstico Electrónico');
    });

    it('Escenario 1: Inactivación Exitosa de un Mecánico', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/mechanics/${createdMechanicId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'INACTIVE',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('INACTIVE');
    });

    it('Verificar que el mecánico permanece INACTIVE', async () => {
      const response = await request(app.getHttpServer())
        .get(`/mechanics/${createdMechanicId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('INACTIVE');
    });
  });

  describe('HU-11: Control de Disponibilidad y Validación de No Cruce de Horarios', () => {
    it('Escenario: Bloqueo de Disponibilidad si el mecánico está INACTIVE', async () => {
      const response = await request(app.getHttpServer())
        .post(`/mechanics/${createdMechanicId}/validate-availability`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          scheduledDate: '2026-11-01T08:00:00.000Z',
          durationMinutes: 90,
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(409);
      expect(response.body.message).toContain('No se puede asignar un mantenimiento a un mecánico inactivo');
    });

    it('Escenario: Reactivar Mecánico y Validar Disponibilidad Exitosa', async () => {
      await request(app.getHttpServer())
        .patch(`/mechanics/${createdMechanicId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'ACTIVE' });

      const response = await request(app.getHttpServer())
        .post(`/mechanics/${createdMechanicId}/validate-availability`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          scheduledDate: '2026-11-01T08:00:00.000Z',
          durationMinutes: 90,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.available).toBe(true);
    });
  });
});
