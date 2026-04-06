# Flujo de Entregas

## Resumen
Los postulantes suben sus propuestas (archivos o links) que luego son evaluadas por el jurado.

## Ciclo de vida de una entrega

```
SUBIDA -> INDETERMINADO -> [Seleccionar propuesta] -> PENDIENTE -> APROBADA / RECHAZADA
```

### 1. Subida (Postulante)
- Desde la seccion "Mis Entregas" del panel de postulante
- Campos: concurso, titulo, descripcion (opcional), archivo o URL
- Archivos soportados: PDF, JPG, PNG, ZIP, DWG (max 20 MB)
- La entrega se crea con estado **INDETERMINADO**

### 2. Seleccionar propuesta (Postulante)
- Mientras la entrega esta en INDETERMINADO, aparece un campo inline
- El postulante escribe el nombre/titulo de su propuesta
- Al confirmar, la entrega pasa a estado **PENDIENTE**
- Endpoint: `PATCH /api/v1/resoluciones/{id}/propuesta?propuesta=...`

### 3. Revision (Admin)
- El admin ve las entregas en su dashboard (propuestas recibidas)
- Puede cambiar el estado a **APROBADA** o **RECHAZADA**
- Endpoint: `PATCH /api/v1/resoluciones/{id}/estado?estado=...`

### 4. Visualizacion (Postulante)
- El postulante ve el estado actualizado en su panel
- Colores: gris (indeterminado), amarillo (pendiente), verde (aprobada), rojo (rechazada)

## Entregas en equipo
- Tipo: INDIVIDUAL o EQUIPO
- Para equipo: se vinculan miembros via tabla `resolucion_miembro`
- Todos los miembros ven la entrega en su panel

## Modelo de datos

### Tabla `resolucion`
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | BIGSERIAL | PK |
| postulante_id | BIGINT FK | Quien subio |
| concurso_id | BIGINT FK | Para que concurso |
| titulo | VARCHAR(200) | Titulo de la entrega |
| descripcion | TEXT | Descripcion opcional |
| archivo_nombre | VARCHAR(255) | Nombre del archivo |
| archivo_datos | BYTEA | Contenido del archivo |
| url_externo | VARCHAR(500) | Link externo (Drive, etc.) |
| estado | VARCHAR(20) | INDETERMINADO/PENDIENTE/APROBADA/RECHAZADA |
| tipo_entrega | VARCHAR(20) | INDIVIDUAL/EQUIPO |
| propuesta | VARCHAR(200) | Nombre de la propuesta |
| creado_en | TIMESTAMPTZ | Fecha de subida |

## Endpoints
- `POST /api/v1/resoluciones` — subir entrega (multipart)
- `GET /api/v1/resoluciones/postulante/{id}` — listar por postulante
- `GET /api/v1/resoluciones` — listar todas (admin)
- `PATCH /api/v1/resoluciones/{id}/estado` — cambiar estado (admin)
- `PATCH /api/v1/resoluciones/{id}/propuesta` — seleccionar propuesta (postulante)
- `GET /api/v1/resoluciones/{id}/archivo` — descargar archivo

## Archivos clave
- `app/src/pages/postulante/PostulantePage.tsx` — EntregasSection
- `backend/.../controller/ResolucionController.java`
- `backend/.../model/Resolucion.java`
