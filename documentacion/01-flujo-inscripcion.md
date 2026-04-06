# Flujo de Inscripcion

## Resumen
Proceso completo desde que un interesado se registra hasta que queda como participante oficial del concurso.

## Pasos

### 1. Pre-registro (RegistroPage)
- El interesado completa un formulario liviano: **nombre, apellido, email, universidad**
- No se pide DNI, celular ni especialidad todavia
- Se crea un registro en la tabla `postulante` con DNI/celular/especialidad en NULL
- **No se generan credenciales** en esta etapa
- El formulario esta controlado por la constante `REGISTRO_ABIERTO` en `RegistroPage.tsx`

### 2. Impacto 1: Mail informativo (Admin -> Campanas)
- La admin presiona "Enviar info concurso" en la seccion Campanas
- Se envia un email masivo a todos los pre-registrados que no recibieron info aun
- El email incluye: detalles del concurso, fechas, descripcion, link del webinar/canal
- **CTA**: "Confirmar mi participacion" (link a `/confirmar?token=UUID`)
- Cada postulante recibe un `tokenConfirmacion` unico (UUID)
- Se marca `infoEnviadaEn` en la BD

### 3. Confirmacion de datos (ConfirmacionPage)
- El usuario clickea el link del email y llega a `/confirmar?token=UUID`
- Se muestra un formulario con: **DNI, celular, especialidad, aceptacion de bases**
- Al enviar:
  - Se actualizan los datos duros en la BD
  - Se genera una contrasena aleatoria
  - Se hashea con BCrypt y se guarda
  - Se marca `confirmadoEn` en la BD
  - Se envian 2 emails: credenciales (DNI + password) + confirmacion exitosa

### 4. Impacto 2: Mail de bienvenida (Automatico + Manual)
- **Automatico**: cada 1 hora, el `BienvenidaScheduler` busca confirmados sin bienvenida y les envia el email
- **Manual**: la admin puede presionar "Enviar bienvenida a confirmados" en Campanas
- El email dice: "Tu inscripcion fue confirmada. Pronto recibiras el link de la charla + datos de acceso + concursos.habisite.com"
- Se marca `bienvenidaEnviadaEn` en la BD

### 5. Impacto 3: Segunda convocatoria (Rescate)
- La admin presiona "Enviar segunda convocatoria" en Campanas
- Se envia a quienes recibieron info pero NO confirmaron
- Email urgente: "Ultima oportunidad para confirmar"
- Se marca `recordatorioEnviadoEn` en la BD

### 6. Participante oficial
- El postulante puede ingresar con DNI + contrasena en `concursos.habisite.com/login`
- Accede al panel de postulante: Perfil, Concursos, Entregas, Mi Equipo, Resumen

## Baja del concurso
- Todos los emails incluyen un link "Darme de baja" en el footer
- Al clickear, se elimina al postulante de la BD completamente
- Endpoint: `GET /api/v1/baja?token=UUID`

## Archivos clave
- `app/src/pages/RegistroPage.tsx` — formulario de pre-registro
- `app/src/pages/ConfirmacionPage.tsx` — formulario de confirmacion con datos duros
- `app/src/pages/BajaPage.tsx` — pagina de baja
- `backend/.../controller/ConfirmacionController.java` — endpoints de confirmacion
- `backend/.../service/impl/CampanaServiceImpl.java` — logica de campanas y confirmacion
- `backend/.../service/impl/BienvenidaScheduler.java` — scheduler automatico cada hora
- `backend/.../service/impl/EmailServiceImpl.java` — todas las plantillas de email
