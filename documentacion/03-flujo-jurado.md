# Flujo del Jurado

## Acceso
- URL: `concursos.habisite.com/login`
- Credenciales por defecto: usuario `jurado`, contrasena `jurado2025`
- Se pueden crear mas jurados desde el panel de admin (seccion Configuracion)

## Panel del jurado (sidebar)
Secciones disponibles:

### 1. Postulantes
- Lista de todos los postulantes con barra de progreso (evaluados/total)
- Buscador por nombre, universidad, especialidad
- Filtro: "Pendientes" (sin evaluar) o "Todos"
- Al tocar un postulante se abre el modal de evaluacion

### 2. Mis Evaluaciones
- Stats: total evaluaciones, promedio, maximo, minimo
- Lista de evaluaciones ordenadas por puntaje (mayor a menor)
- Cada card muestra: nombre del postulante, puntaje, fecha

### 3. Estadisticas
- Mi progreso: evaluados vs pendientes vs total con barra de progreso
- Distribucion de puntajes: grafico de barras 1-10 con colores
- Ranking general: top 10 postulantes por promedio ponderado de todos los jurados

## Evaluacion por criterios dinamicos
- Los criterios se configuran por concurso desde el admin
- Cada criterio tiene: nombre (ej. "Innovacion") y peso (ej. x3)
- El jurado asigna un puntaje 1-10 por cada criterio
- El sistema calcula el **promedio ponderado**: `sum(puntaje * peso) / sum(peso)`
- El promedio se muestra en tiempo real mientras evalua
- El promedio ponderado se guarda como el `puntaje` final de la evaluacion

### Criterios por defecto (seed)
| Criterio | Peso |
|----------|------|
| Innovacion | x3 |
| Viabilidad tecnica | x2 |
| Impacto ambiental | x2 |
| Presentacion visual | x2 |
| Funcionalidad del espacio | x1 |

### Fallback
- Si no hay criterios configurados para el concurso, se muestra el selector clasico de puntaje unico 1-10

## Onboarding
- Tour de 3 pasos al primer ingreso
- Key: `habisite_jurado_onboarding_v2`

## Archivos clave
- `app/src/pages/jurado/JuradoPage.tsx` — panel completo
- `backend/.../controller/CriterioController.java` — CRUD de criterios
- `backend/.../model/CriterioEvaluacion.java` — modelo de criterios
- `backend/.../model/EvaluacionCriterio.java` — puntaje por criterio
