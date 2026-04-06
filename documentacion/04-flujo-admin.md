# Flujo del Administrador

## Acceso
- URL: `concursos.habisite.com/login`
- Credenciales por defecto: usuario `admin`, contrasena `habisite2025`
- En produccion se recomienda setear `ADMIN_SEED_PASS` en Railway para usar otra contrasena

## Panel del admin (sidebar)
Secciones disponibles:

### 1. Dashboard
- Stats cards: total postulantes, entregas pendientes, propuestas recibidas, jurados activos
- **Entregas proximas a vencer**: concursos activos que terminan en menos de 14 dias
- **Postulantes sin entregas**: lista de postulantes que no subieron ninguna entrega

### 2. Concursos
- Lista de todos los concursos con badge de estado (ACTIVO/CERRADO/PROXIMO/TERMINADO)
- Cada concurso muestra: titulo, fechas, cantidad de entregas
- **Edicion inline**: click en "Editar" para modificar titulo, descripcion, bases, fechas, estado
- Los cambios se guardan con PUT al backend

### 3. Postulantes
- Lista completa searchable por nombre, DNI, email, universidad
- Cada fila muestra: nombre, DNI, email, universidad, especialidad
- Boton para regenerar clave de un postulante

### 4. Campanas
Tres acciones disponibles:

#### Enviar info concurso
- Formulario con: URL del webinar, fecha del webinar, URL del canal, nombre del canal
- Envia email masivo a todos los pre-registrados que no recibieron info
- Incluye link de confirmacion

#### Segunda convocatoria
- Envia recordatorio a quienes recibieron info pero no confirmaron
- Email urgente de "ultima oportunidad"

#### Bienvenida a confirmados
- Envia email a confirmados que no recibieron bienvenida
- Les avisa que pronto recibiran: link de la charla + datos de acceso + concursos.habisite.com
- **Tambien se ejecuta automaticamente cada 1 hora** (scheduler)

#### Tabla de estado
- Muestra cada postulante con: info enviada (si/no), confirmado (si/no), recordatorio (si/no), estado general

### 5. Evaluaciones
- Stats: promedio general, maximo, minimo
- Lista de todas las evaluaciones de todos los jurados
- Buscador por nombre de postulante
- Cada fila: postulante, jurado, puntaje, fecha

### 6. Jurado
- Lista de jurados con su progreso individual
- Por jurado: evaluaciones completadas vs total, promedio, maximo, minimo
- Barra de progreso visual

### 7. Configuracion
- CRUD de usuarios admin/jurado
- Crear: nombre, username, contrasena, rol (ADMIN o JURADO)
- Eliminar usuarios

## Onboarding
- Tour de 7 pasos al primer ingreso
- Key: `habisite_admin_onboarding_v3`

## Archivos clave
- `app/src/pages/admin/AdminPage.tsx` — panel completo
- `backend/.../controller/AdminController.java` — stats
- `backend/.../controller/CampanaController.java` — campanas
- `backend/.../controller/UsuarioController.java` — CRUD usuarios
- `backend/.../controller/ConcursoController.java` — CRUD concursos
