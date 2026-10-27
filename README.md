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

Contenido oficial de `.env`:
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

## Poblado de Base de Datos (Seeder Idempotente)

Para poblar la base de datos con el dataset requerido de prueba de forma **idempotente** (sin duplicar registros si se ejecuta varias veces):

```bash
npm run seed
```

El seeder inicializa exactamente:
- **1 Usuario ADMIN** (`admin@fleetcore.com` / `FleetCore2026!`)
- **2 Usuarios TECHNICIAN** (`tecnico1@fleetcore.com`, `tecnico2@fleetcore.com` / `FleetCore2026!`)
- **3 Mecánicos** (2 activos vinculados a los técnicos y 1 inactivo)
- **2 Talleres** (1 activo y 1 inactivo)
- **4 Vehículos** (2 AVAILABLE, 1 IN_MAINTENANCE con orden IN_PROGRESS, y 1 INACTIVE)
- **Mantenimientos** (1 COMPLETED para historial y 1 IN_PROGRESS)

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

## Documentación Swagger UI (OpenAPI)

Con la aplicación en ejecución (`npm run start:dev`), accede a la interfaz interactiva de Swagger en:
```
http://localhost:3000/api/docs
```
Permite probar interactivamente los **26 endpoints** de la plataforma, autorizándose mediante el botón **Authorize** con tokens Bearer JWT o la cabecera `x-api-key`.

---

## Ejecución de Pruebas Automatizadas

```bash
# Ejecutar todas las suites de prueba e2e (Épicas 1 a 7)
npm run test:e2e

# Validar formato y lint
npm run lint
```

---

## Resumen de Épicas Implementadas

### Épica 1: Autenticación, Control de Acceso (RBAC) y Seguridad API Key
- `POST /auth/register` — **HU-01**: Registro de usuarios (`ADMIN` o `TECHNICIAN`) con hashing Bcrypt.
- `POST /auth/login` — **HU-02**: Inicio de sesión y emisión de JWT firmado (`JWT_SECRET`, 1h).
- `GET /auth/profile` — **HU-03**: Consulta de perfil de usuario autenticado mediante `@CurrentUser()`.
- `GET /auth/admin-only` — **HU-03**: Endpoint restringido por RBAC a rol `ADMIN`.
- `GET /auth/technician-only` — **HU-03**: Endpoint restringido por RBAC a rol `TECHNICIAN`.
- `GET /external/vehicles/:plate/history` — **HU-04**: Integración externa autorizada vía `x-api-key`.

### Épica 2: Gestión del Parque Automotor (Flota de Vehículos)
- `POST /vehicles` — **HU-05**: Alta de vehículos con placa única y estado inicial `AVAILABLE` (ADMIN).
- `GET /vehicles` — **HU-06**: Listado general de flota de vehículos (ADMIN, TECHNICIAN).
- `GET /vehicles/:id` — **HU-06**: Consulta de vehículo individual por ID (ADMIN, TECHNICIAN).
- `GET /vehicles/plate/:plate` — **HU-06**: Búsqueda directa de vehículo por placa (ADMIN, TECHNICIAN).
- `PATCH /vehicles/:id` — **HU-07**: Actualización de atributos permitidos (ADMIN).
- `PATCH /vehicles/:id/inactivate` — **HU-07**: Retiro lógico e inactivación (`INACTIVE`) preservando historial (ADMIN).
- `PATCH /vehicles/:id/status` — **HU-07**: Actualización de estado operativo (ADMIN).

### Épica 3: Gestión de Personal Técnico y Mecánicos
- `POST /mechanics` — **HU-08**: Alta de mecánicos con correo único, especialidad y estado inicial `ACTIVE` (ADMIN).
- `GET /mechanics` — **HU-09**: Consulta general de mecánicos registrados (ADMIN, TECHNICIAN).
- `GET /mechanics/:id` — **HU-09**: Consulta individual y ficha técnica por ID (ADMIN, TECHNICIAN).
- `PATCH /mechanics/:id` — **HU-10**: Actualización de datos del mecánico (ADMIN).
- `PATCH /mechanics/:id/status` — **HU-10**: Activación o inactivación lógica preservando historial (ADMIN).
- `POST /mechanics/:id/validate-availability` — **HU-11**: Validación de disponibilidad y no cruce de horarios (ADMIN, TECHNICIAN).

### Épica 4: Gestión de Talleres y Centros de Operación
- `POST /workshops` — **HU-12**: Registro y alta de talleres con estado inicial `ACTIVE` (ADMIN).
- `GET /workshops` — **HU-13**: Consulta general y filtrado de talleres con query `?status=ACTIVE` (ADMIN, TECHNICIAN).
- `GET /workshops/active` — **HU-13**: Ruta dedicada para consulta de talleres activos (ADMIN, TECHNICIAN).
- `GET /workshops/:id` — **HU-13**: Consulta de taller por ID (ADMIN, TECHNICIAN).
- `PATCH /workshops/:id` — **HU-12**: Actualización de nombre y dirección del taller (ADMIN).
- `PATCH /workshops/:id/status` — **HU-12**: Activación / inactivación lógica del taller (ADMIN).

### Épica 5: Planificación, Ejecución y Ciclo de Vida de Mantenimientos
- `POST /maintenances` — **HU-14**: Creación y programación de mantenimiento con validaciones de kilometraje, estado de vehículos, mecánicos, talleres y no cruce de horarios (ADMIN).
- `GET /maintenances` — Consulta general de mantenimientos con soporte de filtros (ADMIN, TECHNICIAN).
- `GET /maintenances/active` — Consulta de mantenimientos en curso o programados (`SCHEDULED`, `IN_PROGRESS`) (ADMIN, TECHNICIAN).
- `GET /maintenances/my-assigned` — Agenda técnica del técnico autenticado (ADMIN, TECHNICIAN).
- `GET /maintenances/:id` — Consulta detallada de mantenimiento por ID (ADMIN, TECHNICIAN).
- `PATCH /maintenances/:id/status` — **HU-15 & HU-17**: Transición a `IN_PROGRESS` (con cambio atómico de vehículo a `IN_MAINTENANCE`) o a `CANCELLED` (con liberación a `AVAILABLE`) (ADMIN, TECHNICIAN).
- `PATCH /maintenances/:id/complete` — **HU-16**: Cierre y liquidación técnica obligatoria (trabajo realizado, costo, fecha y odómetro), liberando vehículo a `AVAILABLE` de forma irreversible (ADMIN, TECHNICIAN).

### Épica 6: Trazabilidad, Historiales e Integración de Socios Externos
- `GET /maintenances` — **HU-18**: Monitoreo global de órdenes con filtros de estado, vehículo y mecánico (ADMIN).
- `GET /maintenances/my-assigned` — **HU-18**: Consulta de agenda y asignaciones individuales del técnico autenticado (TECHNICIAN).
- `GET /maintenances/active` — **HU-18**: Filtro rápido de intervenciones activas (ADMIN, TECHNICIAN).
- `GET /external/vehicles/:plate/history` — **HU-19**: Consulta externa de historial con cabecera `x-api-key` autorizada.
- `GET /vehicles/:id/history` — **HU-19**: Consulta interna autenticada de historial de intervenciones por vehículo.

### Épica 7: Arquitectura Transversal, Persistencia, Filtros y Seeders
- **HU-20: Interceptor Global (`ResponseTransformInterceptor`)**: Formato uniforme `{ success: true, statusCode, data, timestamp }`.
- **HU-21: Exception Filter Global Anti-500 (`HttpExceptionFilter`)**: Formato uniforme `{ success: false, statusCode, message, path, timestamp }`.
- **HU-22: Variables de Entorno, Documentación Swagger y Seeder Idempotente**: Dataset mínimo verificado, `.env.example`, y CLI `npm run seed`.
