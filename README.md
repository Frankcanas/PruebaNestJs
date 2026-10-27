# FleetCore API REST — Módulo 6.2 NestJS

Sistema de Gestión y Control del Ciclo de Vida de Mantenimiento de Flota Vehicular.

## Stack Tecnológico
- **NestJS v12**
- **TypeScript**
- **PostgreSQL & TypeORM**
- **JWT (JSON Web Token) & Passport**
- **Bcrypt (Hashing Seguro)**
- **Class-Validator & Class-Transformer**
- **Swagger / OpenAPI**
- **Vitest & Supertest**

---

## Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto tomando como plantilla `.env.example`:

```bash
cp .env.example .env
```

Contenido de `.env`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=fleetcore
JWT_SECRET=cambia-este-secreto
JWT_EXPIRES_IN=1h
API_KEYS=demo-key-partner-1,demo-key-partner-2
```

---

## Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Compilar proyecto
npm run build

# Iniciar en modo desarrollo
npm run start:dev

# Iniciar en modo producción
npm run start:prod
```

---

## Documentación Swagger (OpenAPI)

Con la aplicación en ejecución, la documentación interactiva Swagger se encuentra disponible en:
```
http://localhost:3000/api/docs
```

---

## Ejecución de Pruebas

```bash
# Ejecutar suite de pruebas de Épica 1
npm run test:e2e

# Validar código con linter
npm run lint
```

---

## Épica 1: Autenticación, Control de Acceso (RBAC) y Seguridad API Key

### HU-01: Registro de Usuarios con Roles Específicos y Hashing Seguro
- **Endpoint**: `POST /auth/register`
- **Acceso**: `@Public()`
- **Entrada**: `{ email: string, password: string, role: 'ADMIN' | 'TECHNICIAN' }`
- **Salida**: `{ id: number, email: string, role: string, createdAt: string }`
- **Comportamiento**:
  - Hashing criptográfico seguro con Bcrypt (10 salt rounds).
  - Nunca expone la contraseña en la respuesta.
  - Validación de email duplicado retornando `HTTP 409 Conflict`.
  - Validación estricta de formato y roles permitidos retornando `HTTP 400 Bad Request`.

### HU-02: Inicio de Sesión y Emisión de Token JWT
- **Endpoint**: `POST /auth/login`
- **Acceso**: `@Public()`
- **Entrada**: `{ email: string, password: string }`
- **Salida**: `{ accessToken: string, user: { id: number, email: string, role: string } }`
- **Comportamiento**:
  - Verificación contra hash de base de datos.
  - Generación de token JWT firmado con `JWT_SECRET` y payload `{ sub, email, role }`.
  - Credenciales inválidas o usuario inexistente retornan `HTTP 401 Unauthorized`.

### HU-03: Control de Acceso Basado en Roles (RBAC) y Decoradores Personalizados
- **Seguridad transversal**: `JwtAuthGuard` + `RolesGuard` aplicados globalmente.
- **Rutas privadas por defecto**: Cualquier endpoint no marcado con `@Public()` exige un Bearer Token JWT válido en cabecera `Authorization`.
- **Decoradores Personalizados**:
  - `@Public()`: Permite acceso no autenticado.
  - `@Roles(...roles)`: Restringe acceso por roles (`ADMIN`, `TECHNICIAN`).
  - `@CurrentUser()`: Inyecta el usuario autenticado desde el contexto de la petición.
- **Respuestas de error**:
  - Sin token / token corrupto -> `HTTP 401 Unauthorized`.
  - Rol no autorizado -> `HTTP 403 Forbidden`.

### HU-04: Autenticación para Integraciones Externas mediante API Key
- **Endpoint**: `GET /external/vehicles/:plate/history`
- **Seguridad**: `ApiKeyGuard` validando cabecera `x-api-key`.
- **Comportamiento**:
  - Valida la clave contra las registradas en `API_KEYS` (.env).
  - Si es válida -> `HTTP 200 OK`.
  - Si es inválida o ausente -> `HTTP 401 Unauthorized` con mensaje `'API Key inválida o no proporcionada'`.

---

## Estándares Transversales Implementados

- **HU-20: Interceptor Global (`ResponseTransformInterceptor`)**:
  Estandariza todas las respuestas exitosas:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": { ... },
    "timestamp": "2026-10-27T08:00:00.000Z"
  }
  ```

- **HU-21: Exception Filter Global Anti-500 (`HttpExceptionFilter`)**:
  Centraliza y formatea todas las excepciones evitando errores 500 no controlados:
  ```json
  {
    "success": false,
    "statusCode": 409,
    "message": "El correo electrónico ya se encuentra registrado",
    "path": "/auth/register",
    "timestamp": "2026-10-27T08:00:00.000Z"
  }
  ```
