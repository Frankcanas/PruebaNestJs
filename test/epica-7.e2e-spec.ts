import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { runSeeder } from '../src/seed.js';

describe('ÉPICA 7: Arquitectura Transversal, Persistencia, Filtros y Seeders', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('HU-20: Estandarización Global de Respuestas Exitosas vía Interceptor', () => {
    it('Escenario 1: Envoltorio Automático con success, statusCode, data, timestamp', async () => {
      const response = await request(app.getHttpServer()).post('/auth/login').send({
        email: 'admin@fleetcore.com',
        password: 'FleetCore2026!',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('statusCode', 200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp).getTime()).not.toBeNaN();
    });
  });

  describe('HU-21: Manejo Centralizado de Excepciones y Filtro Global de Errores (Anti-500)', () => {
    it('Escenario 1: Mapeo Uniforme de Excepciones con success: false, statusCode, message, path, timestamp', async () => {
      const response = await request(app.getHttpServer()).get('/vehicles/999999');

      // 401 Unauthorized por falta de token
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('statusCode', 401);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('path', '/vehicles/999999');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('Escenario 2: Protección contra Errores de Base de Datos y Prevención de HTTP 500', async () => {
      // Intentar registrar usuario con email duplicado para validar que no lanza 500
      const response = await request(app.getHttpServer()).post('/auth/register').send({
        email: 'admin@fleetcore.com',
        password: 'Password123!',
        role: 'ADMIN',
      });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(409);
      expect(response.body.message).toContain('El correo electrónico ya se encuentra registrado');
      expect(response.body.path).toBe('/auth/register');
    });
  });

  describe('HU-22: Variables de Entorno, Documentación Swagger y Seeder Idempotente', () => {
    it('Escenario 1: Ejecución Idempotente del Seeder dos veces consecutivas', async () => {
      // Ejecución 1
      await expect(runSeeder(true)).resolves.not.toThrow();
      // Ejecución 2 (Idempotente - no debe fallar ni duplicar)
      await expect(runSeeder(true)).resolves.not.toThrow();
    });

    it('Verificación de credenciales y roles del dataset del Seeder oficial', async () => {
      // 1. Login ADMIN oficial
      const adminLogin = await request(app.getHttpServer()).post('/auth/login').send({
        email: 'admin@fleetcore.com',
        password: 'FleetCore2026!',
      });
      expect(adminLogin.status).toBe(200);
      expect(adminLogin.body.data.user.role).toBe('ADMIN');
      const adminToken = adminLogin.body.data.accessToken;

      // 2. Login TECHNICIAN oficial 1
      const techLogin1 = await request(app.getHttpServer()).post('/auth/login').send({
        email: 'tecnico1@fleetcore.com',
        password: 'FleetCore2026!',
      });
      expect(techLogin1.status).toBe(200);
      expect(techLogin1.body.data.user.role).toBe('TECHNICIAN');

      // 3. Login TECHNICIAN oficial 2
      const techLogin2 = await request(app.getHttpServer()).post('/auth/login').send({
        email: 'tecnico2@fleetcore.com',
        password: 'FleetCore2026!',
      });
      expect(techLogin2.status).toBe(200);
      expect(techLogin2.body.data.user.role).toBe('TECHNICIAN');

      // 4. Verificar vehículos del seeder
      const vAvailable = await request(app.getHttpServer())
        .get('/vehicles/plate/ABC123')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(vAvailable.body.data.status).toBe('AVAILABLE');

      const vMaint = await request(app.getHttpServer())
        .get('/vehicles/plate/GHI789')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(vMaint.body.data.status).toBe('IN_MAINTENANCE');

      const vInactive = await request(app.getHttpServer())
        .get('/vehicles/plate/JKL012')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(vInactive.body.data.status).toBe('INACTIVE');

      // 5. Verificar que el vehículo ABC123 tiene mantenimiento COMPLETED
      const hist = await request(app.getHttpServer())
        .get('/external/vehicles/ABC123/history')
        .set('x-api-key', 'demo-key-partner-1');
      expect(hist.status).toBe(200);
      expect(hist.body.data.maintenances.length).toBeGreaterThanOrEqual(1);
      expect(
        hist.body.data.maintenances.some((m: any) => m.status === 'COMPLETED'),
      ).toBe(true);
    });
  });
});
