# Flujo de Evaluacion

## Resumen
Los jurados evaluan las propuestas de los postulantes usando criterios dinamicos con pesos ponderados.

## Criterios de evaluacion

### Configuracion (Admin)
- Los criterios se configuran por concurso desde el endpoint de criterios
- Cada criterio tiene: **nombre**, **peso** (multiplicador) y **orden**
- Se pueden crear, listar y eliminar

### Criterios por defecto (seed)
| # | Criterio | Peso |
|---|----------|------|
| 1 | Innovacion | x3 |
| 2 | Viabilidad tecnica | x2 |
| 3 | Impacto ambiental | x2 |
| 4 | Presentacion visual | x2 |
| 5 | Funcionalidad del espacio | x1 |

### Puntaje ponderado
- El jurado asigna **1-10** por cada criterio
- Promedio ponderado = `sum(puntaje * peso) / sum(peso)`
- Ejemplo: Innovacion=8(x3) + Viabilidad=6(x2) + Impacto=7(x2) + Presentacion=9(x2) + Funcionalidad=5(x1)
  - = (24 + 12 + 14 + 18 + 5) / (3+2+2+2+1) = 73/10 = **7.3**

## Proceso de evaluacion

### 1. Jurado abre un postulante
- Desde la seccion "Postulantes" del panel de jurado
- Ve las entregas del postulante (archivos descargables + links)

### 2. Asigna puntaje por criterio
- Si hay criterios configurados: muestra cada criterio como fila con botones 1-10
- Si no hay criterios: fallback a puntaje unico 1-10
- El promedio ponderado se calcula y muestra en tiempo real

### 3. Guarda evaluacion
- Se envia al backend como `puntaje` (el promedio ponderado)
- Una vez guardada, no se puede modificar
- El jurado ve "Ya evaluaste a este postulante" con los puntajes asignados

### 4. Ranking
- En la seccion Estadisticas, se muestra el ranking general
- Promedio de todos los jurados por postulante
- Top 10 con medallas (oro, plata, bronce)

## Supervision (Admin)
- Seccion "Jurado" en el admin
- Muestra progreso de cada jurado: evaluaciones completadas vs total
- Promedio, maximo, minimo por jurado
- Permite detectar jurados que se atrasan

## Modelo de datos

### Tabla `criterio_evaluacion`
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | BIGSERIAL | PK |
| concurso_id | BIGINT FK | Concurso al que pertenece |
| nombre | VARCHAR(100) | Nombre del criterio |
| peso | INTEGER | Multiplicador (1-5) |
| orden | INTEGER | Orden de aparicion |

### Tabla `evaluacion_criterio`
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | BIGSERIAL | PK |
| evaluacion_id | BIGINT FK | Evaluacion padre |
| criterio_id | BIGINT FK | Criterio evaluado |
| puntaje | INTEGER | 1-10 |

### Tabla `evaluacion` (existente)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| puntaje | INTEGER | Promedio ponderado final |
| jurado_nombre | VARCHAR(100) | Quien evaluo |
| postulante_id | BIGINT FK | Evaluado |

## Endpoints
- `GET /api/v1/criterios/concurso/{id}` — listar criterios de un concurso
- `POST /api/v1/criterios/concurso/{id}` — crear criterio
- `DELETE /api/v1/criterios/{id}` — eliminar criterio
- `POST /api/v1/evaluaciones` — crear evaluacion
- `GET /api/v1/evaluaciones` — listar todas

## Archivos clave
- `app/src/pages/jurado/JuradoPage.tsx` — ModalEvaluar con criterios dinamicos
- `backend/.../controller/CriterioController.java`
- `backend/.../model/CriterioEvaluacion.java`
- `backend/.../model/EvaluacionCriterio.java`
