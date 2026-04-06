# Flujo del Postulante

## Acceso
- URL: `concursos.habisite.com/login`
- Credenciales: DNI + contrasena (generada automaticamente al confirmar inscripcion)
- Opcion "Recordarme" guarda sesion en localStorage
- Opcion "Ver tutorial" resetea el onboarding

## Panel del postulante (sidebar)
Secciones disponibles:

### 1. Mi Perfil
- Muestra datos personales: nombre, apellidos, DNI, celular, universidad, email, especialidad
- Boton "Editar" para actualizar datos (excepto DNI que es fijo)
- Banner con iniciales y especialidad

### 2. Concursos
- Lista de todos los concursos disponibles
- Cada tarjeta muestra: titulo, estado (badge a la derecha), fechas, dias restantes
- Bases expandibles del concurso
- Estados: ACTIVO, PROXIMO, CERRADO, TERMINADO

### 3. Mis Entregas
- Boton "Nueva entrega" para subir archivos o links
- Campos: concurso, titulo, descripcion, archivo (PDF/ZIP/imagen) o URL de Google Drive
- Las entregas se crean con estado **INDETERMINADO**
- El postulante debe **seleccionar una propuesta** (nombre de la idea) para que pase a PENDIENTE
- Estados visibles: INDETERMINADO (gris), PENDIENTE (amarillo), APROBADA (verde), RECHAZADA (rojo)

### 4. Mi Equipo
- Busqueda por DNI para agregar companeros de equipo
- Si el DNI ya existe en el sistema: auto-fill de datos, se comparten entregas
- Si no existe: se crea un nuevo postulante con los datos ingresados y se le envian credenciales por email
- Lista de miembros del equipo con opcion de eliminar
- Campos por miembro: DNI, nombres, apellidos, email, celular

### 5. Resumen (Dashboard)
- Stats rapidas: concursos activos, entregas enviadas, pendientes de revision, aprobadas
- Lista de ultimas entregas con estado

## Logout
- Boton "Cerrar sesion" en la sidebar
- Setea flag `habisite_logout` para evitar auto-login
- Limpia sessionStorage y localStorage
- Redirige a `/login`

## Onboarding
- Tour de 5 pasos al primer ingreso (spotlight sobre cada item del sidebar)
- Se puede re-ver desde el link "Ver tutorial" en el login
- Key: `habisite_onboarding_v3`

## Archivos clave
- `app/src/pages/postulante/PostulantePage.tsx` — panel completo
- `backend/.../controller/EquipoController.java` — CRUD de equipos
- `backend/.../controller/ResolucionController.java` — entregas
