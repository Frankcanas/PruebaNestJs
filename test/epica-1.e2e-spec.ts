import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { AppModule } from '../src/app.module.js';

describe('ÉPICA 1: Autenticación, Control de Acceso (RBAC) y Seguridad API Key', () => {
  let app: INestApplication;
  let adminToken: string;
  let techToken: string;

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

  describe('HU-01: Registro de Usuarios con Roles Específicos y Hashing Seguro', () => {
    const uniqueSuffix = Date.now();
    const adminEmail = `admin_${uniqueSuffix}@fleetcore.com`;
    const techEmail = `tech_${uniqueSuffix}@fleetcore.com`;

    it('Escenario 1: Registro Exitoso de Usuario con Contraseña Hasheada (ADMIN)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: adminEmail,
          password: 'Password123!',
          role: 'ADMIN',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.statusCode).toBe(201);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.email).toBe(adminEmail);
      expect(response.body.data.role).toBe('ADMIN');
      expect(response.body.data.createdAt).toBeDefined();
      // Regla: Nunca debe retornar password
      expect(response.body.data.password).toBeUndefined();
    });

    it('Escenario 1: Registro Exitoso de Usuario (TECHNICIAN)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: techEmail,
          password: 'Password123!',
          role: 'TECHNICIAN',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(techEmail);
      expect(response.body.data.role).toBe('TECHNICIAN');
      expect(response.body.data.password).toBeUndefined();
    });

    it('Escenario 2: Intento de Registro con Email Duplicado', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: adminEmail,
          password: 'AnotherPassword!',
          role: 'ADMIN',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(409);
      expect(response.body.message).toContain('El correo electrónico ya se encuentra registrado');
    });

    it('Escenario 3: Validación de Rol y Formato de Entrada (Rol no permitido)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `invalid_${uniqueSuffix}@fleetcore.com`,
          password: 'Password123!',
          role: 'SUPERADMIN',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(400);
    });

    it('Escenario 3: Validación de campos incompletos (Falta password)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `nopass_${uniqueSuffix}@fleetcore.com`,
          role: 'ADMIN',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('HU-02: Inicio de Sesión y Emisión de Token JWT', () => {
    const uniqueSuffix = Date.now();
    const loginEmail = `login_${uniqueSuffix}@fleetcore.com`;
    const techLoginEmail = `techlogin_${uniqueSuffix}@fleetcore.com`;
    const validPassword = 'SecurePassword123!';

    beforeAll(async () => {
      // Registrar admin para pruebas de login
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: loginEmail,
          password: validPassword,
          role: 'ADMIN',
        });

      // Registrar technician para pruebas de login
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: techLoginEmail,
          password: validPassword,
          role: 'TECHNICIAN',
        });
    });

    it('Escenario 1: Autenticación Exitosa y Generación de JWT para ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: loginEmail,
          password: validPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(loginEmail);
      expect(response.body.data.user.role).toBe('ADMIN');

      adminToken = response.body.data.accessToken;

      // Verificar que el payload contiene sub, email, role
      const payloadBase64 = adminToken.split('.')[1];
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
      expect(payload.sub).toBe(response.body.data.user.id);
      expect(payload.email).toBe(loginEmail);
      expect(payload.role).toBe('ADMIN');
    });

    it('Escenario 1: Autenticación Exitosa para TECHNICIAN', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: techLoginEmail,
          password: validPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user.role).toBe('TECHNICIAN');
      techToken = response.body.data.accessToken;
    });

    it('Escenario 2: Credenciales Inválidas por Contraseña Incorrecta', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: loginEmail,
          password: 'WrongPassword!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBe('Credenciales de acceso inválidas');
    });

    it('Escenario 2: Credenciales Inválidas por Usuario Inexistente', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@fleetcore.com',
          password: 'AnyPassword!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBe('Credenciales de acceso inválidas');
    });
  });

  describe('HU-03: Control de Acceso Basado en Roles (RBAC) y Decoradores Personalizados', () => {
    it('Escenario 1: Acceso Permitido a Usuario con Rol Requerido (@Roles(ADMIN))', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/admin-only')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Acceso concedido a zona administrativa');
      expect(response.body.data.user.role).toBe('ADMIN');
    });

    it('Escenario 2: Denegación de Acceso por Rol Insuficiente (TECHNICIAN a ruta ADMIN)', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/admin-only')
        .set('Authorization', `Bearer ${techToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(403);
      expect(response.body.message).toContain('No tienes permisos suficientes');
    });

    it('Escenario 3: Petición sin Token a Ruta Privada', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(401);
    });

    it('Escenario 3: Petición con Token Corrupto/Inválido', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid.token.value');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(401);
    });

    it('Prueba de Decorador @CurrentUser(): extrae correctamente el usuario autenticado', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${techToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.role).toBe('TECHNICIAN');
      expect(response.body.data.id).toBeDefined();
    });
  });

  describe('HU-04: Autenticación para Integraciones Externas mediante API Key', () => {
    it('Escenario 1: Acceso Autorizado con x-api-key Válida', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/vehicles/ABC123/history')
        .set('x-api-key', 'demo-key-partner-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.vehicle.plate).toBe('ABC123');
    });

    it('Escenario 1: Acceso Autorizado con segunda x-api-key Válida', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/vehicles/XYZ789/history')
        .set('x-api-key', 'demo-key-partner-2');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.vehicle.plate).toBe('XYZ789');
    });

    it('Escenario 2: Denegación de Acceso por API Key Inválida', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/vehicles/ABC123/history')
        .set('x-api-key', 'invalid-api-key');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBe('API Key inválida o no proporcionada');
    });

    it('Escenario 2: Denegación de Acceso por API Key Ausente', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/vehicles/ABC123/history');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBe('API Key inválida o no proporcionada');
    });
  });
});
