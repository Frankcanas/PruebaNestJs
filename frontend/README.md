# FleetCore — Frontend de Integración (React + Vite + Tailwind CSS)

Aplicación web cliente conectada a la API REST de **FleetCore** (NestJS).

## Características Implementadas

- **Autenticación Completa con JWT y RBAC:**
  - Login y Registro de usuarios.
  - Botones de acceso rápido (1 Clic) para credenciales de prueba (`Admin`, `Gestor`, `Mecánico`).
  - Almacenamiento seguro del Bearer Token y persistencia de sesión.
  - Control de accesos y botones según el rol del usuario autenticado.

- **Módulo de Gestión de Flota (Vehículos):**
  - Métricas de flota en tiempo real (Total, Disponibles, En Mantenimiento, Inactivos).
  - Listado con búsqueda dinámica por placa, marca y modelo, y filtrado por estado.
  - Registro de nuevos vehículos con validación de placa única.
  - Desactivación lógica de vehículos.
  - Visualización del historial completo de mantenimientos por vehículo.

- **Módulo de Ciclo de Vida de Mantenimiento:**
  - Filtro por estado: *Todos*, *Activos* (Agendados / En curso) y *Mis Asignados* (para mecánicos).
  - Modal para agendar nuevo mantenimiento seleccionando vehículo, mecánico, taller y fechas.
  - **Máquina de estados interactiva:**
    - `SCHEDULED` ➔ `IN_PROGRESS` (Botón "Iniciar Mantenimiento", actualiza atómicamente el estado del vehículo a `IN_MAINTENANCE`).
    - `IN_PROGRESS` ➔ `COMPLETED` (Modal "Liquidar y Completar" con horas de mano de obra, costo total y notas de cierre; libera el vehículo a `AVAILABLE`).
    - `SCHEDULED` / `IN_PROGRESS` ➔ `CANCELLED` (Modal de cancelación con motivo; libera el vehículo a `AVAILABLE`).

- **Módulo de Mecánicos:**
  - Listado de mecánicos, especialidad técnica y usuario vinculado.
  - Verificador interactivo de disponibilidad en tiempo real por fecha (`/mechanics/:id/validate-availability`).
  - Registro y vinculación de nuevos mecánicos (ADMIN).

- **Módulo de Talleres Aliados:**
  - Listado de talleres con capacidad operativa de bahías, teléfono y dirección.
  - Filtrado de talleres activos (`/workshops/active`).
  - Creación de nuevos talleres aliados (ADMIN).

- **Portal B2B de Socios Externos:**
  - Consulta segura de historial vehicular mediante API Key externa (`x-api-key: demo-key-partner-1`).

---

## Cómo Ejecutar el Frontend

1. Asegúrate de que el backend de NestJS esté corriendo en `http://localhost:3000`.
2. Entra a la carpeta `frontend/`:
   ```bash
   cd frontend
   ```
3. Instala las dependencias (si aún no lo has hecho):
   ```bash
   npm install
   ```
4. Inicia el servidor de desarrollo Vite:
   ```bash
   npm run dev
   ```
5. Abre en tu navegador:
   ```
   http://localhost:5173
   ```
