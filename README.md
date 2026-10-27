# FleetCore API REST — Módulo 6.2 NestJS
### Sistema de Gestión y Control del Ciclo de Vida de Mantenimiento de Flota Vehicular

API REST modular desarrollada en **NestJS v12**, **TypeScript**, **PostgreSQL** y **TypeORM**, diseñada bajo principios de arquitectura empresarial, control de acceso basado en roles (**RBAC**), autenticación perimetral mediante **JWT** y **API Key**, consistencia transaccional atómica, estandarización de respuestas vía interceptores globales, filtro centralizado de excepciones anti-500, contenedorización con **Docker / Docker Compose**, y documentación interactiva con **Swagger (OpenAPI)**.

---

## 🛠️ Stack Tecnológico

- **Framework**: [NestJS v12](https://nestjs.com/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) (ES2023 / NodeNext)
- **Base de Datos**: [PostgreSQL 16](https://www.postgresql.org/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **Contenedorización**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) (Multi-Stage Build)
- **Seguridad y Criptografía**: `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`
- **Validación y Transformación**: `class-validator`, `class-transformer`
- **Documentación de API**: `@nestjs/swagger`, `swagger-ui-express`
- **Testing**: [Vitest](https://vitest.dev/), [Supertest](https://github.com/ladjs/supertest)

---

## ⚙️ Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`:

```bash
cp .env.example .env
```

### Tabla de Variables Oficiales:

| Variable | Descripción | Valor por Defecto / Ejemplo |
| :--- | :--- | :--- |
| `PORT` | Puerto de escucha del servidor HTTP | `3000` |
| `DB_HOST` | Host de la base de datos PostgreSQL | `localhost` (o `postgres` en Docker) |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USERNAME` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `postgres` |
| `DB_NAME` | Nombre de la base de datos | `fleetcore` |
| `JWT_SECRET` | Clave secreta para firma de tokens JWT | `cambia-este-secreto` |
| `JWT_EXPIRES_IN` | Tiempo de vida del token JWT | `1h` |
| `API_KEYS` | Claves autorizadas para socios externos (separadas por coma) | `demo-key-partner-1,demo-key-partner-2` |

---

## 🚀 Despliegue con Docker y Docker Compose (Punto Extra)

El proyecto incluye un `Dockerfile` optimizado multi-etapa y un archivo `docker-compose.yml` que orquesta la API y la base de datos PostgreSQL con `healthcheck` y volumen persistente.

### Comandos de Ejecución Docker:

```bash
# 1. Construir imágenes y levantar servicios en segundo plano
docker compose up --build -d

# 2. Monitorear logs en vivo de la API
docker compose logs -f api

# 3. Ejecutar el seeder idempotente dentro del contenedor
docker compose exec api node dist/seed.js

# 4. Detener todos los contenedores y redes
docker compose down

# 5. Detener eliminando volúmenes de datos
docker compose down -v
```

### Puertos Expuestos en Docker:
- **API REST & Swagger UI**: `http://localhost:3000`
- **PostgreSQL Host**: `localhost:5433` (mapeado al `5432` interno para evitar conflictos con servicios PostgreSQL locales)

---

## 🌱 Poblado de Base de Datos (Seeder Idempotente)

Para poblar la base de datos con el dataset oficial requerido de forma **idempotente** (ejecutarlo una o varias veces consecutivas no genera duplicados ni errores):

```bash
npm run seed
```

### Dataset Inicial Cargado por el Seeder:

| Dominio / Entidad | Cantidad | Detalles del Dataset |
| :--- | :---: | :--- |
| **Usuarios** | **3** | • `admin@fleetcore.com` (`ADMIN`, Clave: `FleetCore2026!`)<br>• `tecnico1@fleetcore.com` (`TECHNICIAN`, Clave: `FleetCore2026!`)<br>• `tecnico2@fleetcore.com` (`TECHNICIAN`, Clave: `FleetCore2026!`) |
| **Mecánicos** | **3** | • `Carlos Pérez` (`ACTIVE`, Frenos y Suspensión, vinculado a `tecnico1`)<br>• `Andrés Gómez` (`ACTIVE`, Motor Diésel, vinculado a `tecnico2`)<br>• `Mario Castro` (`INACTIVE`, Sistemas Eléctricos) |
| **Talleres** | **2** | • `Taller Central Norte` (`ACTIVE`, Av. Industrial 45 # 12-30)<br>• `Taller Sur Histórico` (`INACTIVE`, Calle 80 Sur # 10-20) |
| **Vehículos** | **4** | • `ABC123` (`AVAILABLE`, Chevrolet NPR, 45,000 km)<br>• `DEF456` (`AVAILABLE`, Hino Dutro, 60,000 km)<br>• `GHI789` (`IN_MAINTENANCE`, Kenworth T800, 85,000 km)<br>• `JKL012` (`INACTIVE`, Ford Cargo, 150,000 km) |
| **Mantenimientos** | **2** | • ID 1: `COMPLETED` (Preventivo sobre `ABC123`, costo `$350,000`, historial disponible)<br>• ID 2: `IN_PROGRESS` (Correctivo sobre `GHI789` que fija vehículo en `IN_MAINTENANCE`) |

---

## 💻 Instalación y Ejecución Local (Sin Docker)

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar proyecto TypeScript
npm run build

# 3. Poblar la base de datos
npm run seed

# 4. Iniciar en modo desarrollo con recarga automática
npm run start:dev

# 5. Iniciar en modo producción
npm run start:prod
```

---

## 📖 Documentación Swagger UI (OpenAPI)

Con la aplicación en marcha, ingresa desde cualquier navegador a la interfaz interactiva de Swagger:

🔗 **URL Oficial**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

### Características de la documentación:
- Especificación completa de los **26 endpoints**.
- Esquemas DTO de entrada y salida con validaciones de campos y ejemplos.
- Códigos HTTP modelados: `200`, `201`, `400`, `401`, `403`, `404`, `409`.
- Botón **Authorize** compatible con tokens Bearer JWT (`Bearer <token>`) y cabecera de socio externo (`x-api-key`).

---

## 🧪 Ejecución de Pruebas Automatizadas

La solución cuenta con **7 suites de pruebas e2e** independientes ejecutadas secuencialmente que cubren exhaustivamente las 7 épicas y 22 historias de usuario:

```bash
# Ejecutar todas las pruebas e2e
npm run test:e2e

# Validar calidad de código y reglas con linter
npm run lint
```

### Resumen de Cobertura de Pruebas:
```
Test Files  7 passed (7)
Tests       74 passed (74)
  ✓ test/epica-1.e2e-spec.ts (18 tests) - Autenticación, RBAC y API Key
  ✓ test/epica-2.e2e-spec.ts (12 tests) - Parque Automotor y Vehículos
  ✓ test/epica-3.e2e-spec.ts (11 tests) - Personal Técnico y Mecánicos
  ✓ test/epica-4.e2e-spec.ts (9 tests)  - Talleres Mecánicos
  ✓ test/epica-5.e2e-spec.ts (12 tests) - Ciclo de Vida y Transiciones
  ✓ test/epica-6.e2e-spec.ts (7 tests)  - Monitoreo e Historiales
  ✓ test/epica-7.e2e-spec.ts (5 tests)  - Interceptores, Filtros y Seeder Idempotente
```

---

## 🏛️ Arquitectura del Sistema y Máquinas de Estado

### 1. Ciclo de Vida y Estados del Vehículo:
- `AVAILABLE`: Vehículo operativo. Puede asignarse a nuevos mantenimientos.
- `IN_MAINTENANCE`: Transición automática al iniciar un mantenimiento (`IN_PROGRESS`). Bloquea nuevas órdenes simultáneas.
- `INACTIVE`: Retiro lógico administrativo. Prohibido asociar a nuevos mantenimientos, conservando intacto su historial.

### 2. Máquina de Estados de Mantenimientos y Efectos Colaterales:
```
[SCHEDULED] ───(Iniciar trabajo)───> [IN_PROGRESS] ───(Completar + liquidar)───> [COMPLETED] (Terminal)
     │                                     │
     └─────────────(Cancelar)──────────────┴─────────────────────────────────> [CANCELLED] (Terminal)
```
- **Sincronización Automática Transaccional**:
  - Al pasar a `IN_PROGRESS`: El vehículo cambia atómicamente a `IN_MAINTENANCE`.
  - Al pasar a `COMPLETED`: El vehículo retorna automáticamente a `AVAILABLE` y se actualiza su odómetro.
  - Al pasar a `CANCELLED`: Si el vehículo estaba en `IN_MAINTENANCE`, retorna a `AVAILABLE`.
- **Irreversibilidad Terminal**:
  - Un mantenimiento `COMPLETED` jamás puede retornar a estados previos.
  - Un mantenimiento `CANCELLED` jamás puede reactivarse a `IN_PROGRESS` ni `COMPLETED`.
- **No Concurrencia de Vehículo**:
  - Ningún vehículo puede tener dos órdenes activas simultáneamente (`SCHEDULED` o `IN_PROGRESS`).
- **No Cruce de Horarios de Mecánicos**:
  - Un mecánico no puede tener mantenimientos solapados en fecha/hora en ningún taller.

---

## 📋 Catálogo Completo de Endpoints por Épica

### Épica 1: Autenticación, Control de Acceso (RBAC) y Seguridad API Key
| Método | Endpoint | Rol / Acceso | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | `@Public()` | **HU-01**: Registro de usuarios (`ADMIN`, `TECHNICIAN`) con hashing seguro Bcrypt. | `201`, `400`, `409` |
| `POST` | `/auth/login` | `@Public()` | **HU-02**: Inicio de sesión y emisión de JWT firmado con claims `{ sub, email, role }`. | `200`, `400`, `401` |
| `GET` | `/auth/profile` | Autenticado | **HU-03**: Retorna perfil del usuario en sesión usando el decorador `@CurrentUser()`. | `200`, `401` |
| `GET` | `/auth/admin-only` | `ADMIN` | **HU-03**: Ruta administrativa protegida por RBAC (`@Roles(UserRole.ADMIN)`). | `200`, `403` |
| `GET` | `/auth/technician-only` | `TECHNICIAN` | **HU-03**: Ruta técnica protegida por RBAC (`@Roles(UserRole.TECHNICIAN)`). | `200`, `403` |
| `GET` | `/external/vehicles/:plate/history` | `PARTNER_API` | **HU-04**: Integración externa autorizada vía cabecera `x-api-key`. | `200`, `401`, `404` |

### Épica 2: Gestión del Parque Automotor (Flota de Vehículos)
| Método | Endpoint | Rol / Acceso | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/vehicles` | `ADMIN` | **HU-05**: Alta de vehículo con placa única y estado inicial `AVAILABLE`. | `201`, `400`, `403`, `409` |
| `GET` | `/vehicles` | `ADMIN`, `TECHNICIAN` | **HU-06**: Consulta de flota general con estado operativo y kilometraje. | `200`, `401` |
| `GET` | `/vehicles/plate/:plate` | `ADMIN`, `TECHNICIAN` | **HU-06**: Búsqueda directa de vehículo por número de placa. | `200`, `404` |
| `GET` | `/vehicles/:id` | `ADMIN`, `TECHNICIAN` | **HU-06**: Consulta de ficha técnica de vehículo por ID numérico. | `200`, `404` |
| `PATCH` | `/vehicles/:id` | `ADMIN` | **HU-07**: Actualización de atributos de un vehículo. | `200`, `400`, `403`, `404` |
| `PATCH` | `/vehicles/:id/inactivate` | `ADMIN` | **HU-07**: Retiro lógico e inactivación (`INACTIVE`) preservando historial. | `200`, `403`, `404` |
| `PATCH` | `/vehicles/:id/status` | `ADMIN` | **HU-07**: Actualización directa de estado operativo del vehículo. | `200`, `400`, `404` |

### Épica 3: Gestión de Personal Técnico y Mecánicos
| Método | Endpoint | Rol / Acceso | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/mechanics` | `ADMIN` | **HU-08**: Registro de mecánicos con correo único, especialidad y estado `ACTIVE`. | `201`, `400`, `403`, `409` |
| `GET` | `/mechanics` | `ADMIN`, `TECHNICIAN` | **HU-09**: Consulta general de mecánicos registrados. | `200`, `401` |
| `GET` | `/mechanics/:id` | `ADMIN`, `TECHNICIAN` | **HU-09**: Consulta individual y ficha técnica por ID de mecánico. | `200`, `404` |
| `PATCH` | `/mechanics/:id` | `ADMIN` | **HU-10**: Actualización de información técnica del mecánico. | `200`, `400`, `404` |
| `PATCH` | `/mechanics/:id/status` | `ADMIN` | **HU-10**: Activación / inactivación lógica (`ACTIVE` / `INACTIVE`). | `200`, `404` |
| `POST` | `/mechanics/:id/validate-availability` | `ADMIN`, `TECHNICIAN` | **HU-11**: Validación de disponibilidad y no cruce de horarios para asignación. | `200`, `409` |

### Épica 4: Gestión de Talleres y Centros de Operación
| Método | Endpoint | Rol / Acceso | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/workshops` | `ADMIN` | **HU-12**: Registro y alta de talleres con estado inicial `ACTIVE`. | `201`, `400`, `403` |
| `GET` | `/workshops` | `ADMIN`, `TECHNICIAN` | **HU-13**: Catálogo de talleres con filtro opcional por estado `?status=ACTIVE`. | `200`, `401` |
| `GET` | `/workshops/active` | `ADMIN`, `TECHNICIAN` | **HU-13**: Endpoint dedicado para consultar sedes activas habilitadas. | `200`, `401` |
| `GET` | `/workshops/:id` | `ADMIN`, `TECHNICIAN` | **HU-13**: Consulta individual de taller por identificador. | `200`, `404` |
| `PATCH` | `/workshops/:id` | `ADMIN` | **HU-12**: Actualización de nombre y dirección del taller. | `200`, `400`, `404` |
| `PATCH` | `/workshops/:id/status` | `ADMIN` | **HU-12**: Activación o inactivación lógica de taller. | `200`, `404` |

### Épica 5: Planificación, Ejecución y Ciclo de Vida de Mantenimientos
| Método | Endpoint | Rol / Acceso | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/maintenances` | `ADMIN` | **HU-14**: Creación y programación de mantenimiento con estado `SCHEDULED`. Valida que el vehículo, mecánico y taller existan y estén activos, odómetro >= actual y no cruce de horarios. | `201`, `400`, `403`, `404`, `409` |
| `GET` | `/maintenances/:id` | `ADMIN`, `TECHNICIAN` | Consulta detallada de orden de mantenimiento por ID con relaciones pobladas. | `200`, `404` |
| `PATCH` | `/maintenances/:id/status` | `ADMIN`, `TECHNICIAN` | **HU-15 & HU-17**: Transición a `IN_PROGRESS` (vehículo a `IN_MAINTENANCE`) o a `CANCELLED` (vehículo a `AVAILABLE`). Valida asignación del técnico e irreversibilidad. | `200`, `400`, `403`, `409` |
| `PATCH` | `/maintenances/:id/complete` | `ADMIN`, `TECHNICIAN` | **HU-16**: Cierre y liquidación técnica obligatoria (`workDone`, `cost`, `finishedAt`, `mileage`). Retorna vehículo a `AVAILABLE` de forma irreversible. | `200`, `400`, `403`, `409` |

### Épica 6: Trazabilidad, Historiales e Integración de Socios Externos
| Método | Endpoint | Rol / Acceso | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/maintenances` | `ADMIN`, `TECHNICIAN` | **HU-18**: Monitoreo general con filtros opcionales `status`, `vehicleId`, `mechanicId`. | `200`, `401` |
| `GET` | `/maintenances/active` | `ADMIN`, `TECHNICIAN` | **HU-18**: Filtro rápido de órdenes activas (`SCHEDULED` o `IN_PROGRESS`). | `200`, `401` |
| `GET` | `/maintenances/my-assigned` | `TECHNICIAN` | **HU-18**: Agenda técnica de órdenes asignadas al perfil del técnico autenticado. | `200`, `401` |
| `GET` | `/vehicles/:id/history` | `ADMIN`, `TECHNICIAN` | **HU-19**: Historial de intervenciones por vehículo para usuarios internos autenticados. | `200`, `404` |
| `GET` | `/external/vehicles/:plate/history` | `PARTNER_API` | **HU-19**: Historial por placa protegido mediante cabecera `x-api-key`. | `200`, `401`, `404` |

### Épica 7: Arquitectura Transversal, Persistencia, Filtros y Seeders
- **HU-20: Interceptor Global (`ResponseTransformInterceptor`)**: Formato unificado en todas las respuestas exitosas:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": { ... },
    "timestamp": "2026-10-27T09:00:00.000Z"
  }
  ```
- **HU-21: Exception Filter Global Anti-500 (`HttpExceptionFilter`)**: Formato unificado en todas las excepciones HTTP y errores de base de datos (traduce código PostgreSQL `23505` a `HTTP 409 Conflict`):
  ```json
  {
    "success": false,
    "statusCode": 409,
    "message": "Ya existe un vehículo registrado con la placa indicada",
    "path": "/vehicles",
    "timestamp": "2026-10-27T09:00:00.000Z"
  }
  ```
- **HU-22: Seeder Idempotente y Variables de Entorno**: Script CLI `npm run seed`, archivo `.env.example` y documentación Swagger `/api/docs`.

---

## 📋 Checklist de Calificación y Conformidad Oficial

| Criterio Evaluado | Evidencia y Comportamiento Esperado | Estado |
| :--- | :--- | :---: |
| **Autenticación y Hashing Seguro** | Registro y login funcionando con mecanismo seguro de hashing para contraseñas, emisión de JWT y variables de entorno. | **[ CUMPLIDO ]** |
| **Autorización RBAC y 3 Decoradores** | Guards de NestJS, decoradores personalizados `@Roles()`, `@CurrentUser()` y `@Public()` protegiendo según rol (ADMIN y TECHNICIAN). | **[ CUMPLIDO ]** |
| **Integración Externa con x-api-key** | `ApiKeyGuard` validando cabecera contra `API_KEYS` de `.env` en endpoint para integraciones externas. | **[ CUMPLIDO ]** |
| **Gestor de Vehículos** | CRUD con unicidad de placa, búsqueda por ID o placa, inactivación lógica (evitando borrar historial) y estados (`AVAILABLE`, `IN_MAINTENANCE`, `INACTIVE`). | **[ CUMPLIDO ]** |
| **Gestor de Mecánicos y No Cruce de Horas** | Registro, activación/inactivación, vinculación a técnicos y validación estricta de no cruce de horarios entre mantenimientos activos. | **[ CUMPLIDO ]** |
| **Gestor de Talleres** | Registro, activación/inactivación y bloqueo estricto de asignación a talleres inexistentes o inactivos. | **[ CUMPLIDO ]** |
| **Ciclo de Vida de Mantenimientos** | Creación (`SCHEDULED`), transición a `IN_PROGRESS` (vehículo a `IN_MAINTENANCE`), liquidación obligatoria a `COMPLETED` (vehículo a `AVAILABLE`) e irreversibilidad. | **[ CUMPLIDO ]** |
| **Interceptor de Formato Uniforme** | Formato uniforme aplicado por el interceptor en todas las respuestas exitosas de la API. | **[ CUMPLIDO ]** |
| **Exception Filter Personalizado (Anti-500)** | Mapeo uniforme de errores (código HTTP, mensaje, ruta y fecha) evitando HTTP 500 en validaciones, autenticación, recursos y conflictos de BD. | **[ CUMPLIDO ]** |
| **Persistencia PostgreSQL y TypeORM** | PostgreSQL como base principal con TypeORM y relaciones correctamente definidas entre entidades. | **[ CUMPLIDO ]** |
| **Seeder Idempotente y Variables .env** | Poblamiento con un solo comando (`npm run seed`) que al ejecutarse dos veces no duplica registros, con el dataset exacto y `.env.example`. | **[ CUMPLIDO ]** |
