# Flujo de Equipos

## Resumen
Los postulantes pueden armar equipos de hasta N personas para presentar entregas grupales.

## Como funciona

### 1. Agregar miembros (PostulantePage -> Mi Equipo)
- El postulante ingresa el **DNI** de su companero
- El sistema busca en la BD:

#### Si el DNI ya existe:
- Se auto-completan los campos: nombre, apellido, email, celular
- Se muestra un banner "Ya registrado — se compartiran entregas"
- Al agregar, se crea el vinculo en la tabla `equipo`
- No se envia email (ya tiene cuenta)

#### Si el DNI no existe:
- El postulante completa: nombres, apellidos, email, celular
- Al agregar:
  - Se crea un nuevo registro en `postulante` con los datos
  - Se genera contrasena aleatoria
  - Se envia email con credenciales (DNI + password)
  - Se crea el vinculo en la tabla `equipo`
  - El nuevo miembro hereda universidad y especialidad del owner

### 2. Eliminar miembros
- Boton "Quitar" en cada miembro de la lista
- Solo elimina el vinculo (tabla `equipo`), no borra al postulante

### 3. Entregas en equipo (pendiente frontend)
- En la seccion Entregas, opcion de "Individual" o "Equipo"
- Para equipo: seleccionar miembros con checkbox
- La entrega se vincula a todos los seleccionados via `resolucion_miembro`

## Modelo de datos

### Tabla `equipo`
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | BIGSERIAL | PK |
| postulante_id | BIGINT FK | Quien creo el equipo |
| miembro_id | BIGINT FK nullable | Link al postulante miembro |
| dni | VARCHAR(8) | DNI del miembro |
| email | VARCHAR(150) | Email del miembro |
| celular | VARCHAR(15) | Celular del miembro |
| nombres | VARCHAR(100) | Nombres del miembro |
| apellidos | VARCHAR(100) | Apellidos del miembro |
| creado_en | TIMESTAMPTZ | Fecha de creacion |

### Tabla `resolucion_miembro`
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | BIGSERIAL | PK |
| resolucion_id | BIGINT FK | La entrega |
| postulante_id | BIGINT FK | El miembro del equipo |
| creado_en | TIMESTAMPTZ | Fecha de vinculacion |

## Endpoints
- `GET /api/v1/equipo/{postulanteId}` — listar miembros
- `GET /api/v1/equipo/buscar-dni?dni=...` — buscar postulante por DNI
- `POST /api/v1/equipo/{postulanteId}` — agregar miembro
- `DELETE /api/v1/equipo/{equipoId}` — eliminar miembro

## Archivos clave
- `app/src/pages/postulante/PostulantePage.tsx` — EquipoSection
- `backend/.../controller/EquipoController.java`
- `backend/.../model/Equipo.java`
- `backend/.../repository/EquipoRepository.java`
