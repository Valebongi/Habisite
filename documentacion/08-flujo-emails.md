# Flujo de Emails

## Resumen
El sistema envia emails automaticos y manuales en diferentes momentos del ciclo de vida del concurso.

## Emails existentes

| # | Email | Cuando se envia | Destinatario | Disparador |
|---|-------|----------------|--------------|------------|
| 1 | **Credenciales** | Al confirmar inscripcion o crear miembro de equipo | Postulante | Automatico |
| 2 | **Info concurso** | Admin presiona boton en Campanas | Pre-registrados sin info | Manual |
| 3 | **Confirmacion exitosa** | Al completar formulario de confirmacion | Postulante | Automatico |
| 4 | **Bienvenida** | Cada hora (scheduler) o boton manual | Confirmados sin bienvenida | Auto + Manual |
| 5 | **Segunda convocatoria** | Admin presiona boton en Campanas | No confirmados | Manual |
| 6 | **Ticket soporte** | Al enviar ticket desde login | growthimbar@gmail.com | Automatico |

## Detalle de cada email

### 1. Credenciales
- **Subject**: "Tus credenciales de acceso -- Habisite Design Challenge"
- **Contenido**: datos registrados (nombre, DNI, universidad, etc.) + caja naranja con usuario (DNI) y contrasena + banner azul "Proximamente se habilitara acceso a concursos.habisite.com"
- **Footer**: link de baja del concurso

### 2. Info concurso
- **Subject**: "Informacion detallada del concurso -- Habisite Design Challenge"
- **Contenido**: detalles del concurso (titulo, fechas, estado, descripcion) + CTA "Confirmar mi participacion"
- **CTA link**: `concursos.habisite.com/confirmar?token=UUID`

### 3. Confirmacion exitosa
- **Subject**: "Inscripcion oficial confirmada -- Habisite Design Challenge"
- **Contenido**: banner verde "Tu participacion fue confirmada" + datos del webinar + link del canal

### 4. Bienvenida post-confirmacion
- **Subject**: "Tu inscripcion fue confirmada! -- Habisite Design Challenge"
- **Contenido**: banner verde + lista de proximos pasos (link charla, datos acceso, concursos.habisite.com)
- **Footer**: link de baja del concurso
- **Scheduler**: `BienvenidaScheduler` ejecuta cada 3600000ms (1 hora)

### 5. Segunda convocatoria
- **Subject**: "Ultima oportunidad -- Confirma tu participacion en Habisite"
- **Contenido**: alerta urgente + banner amarillo + CTA "Confirmar ahora"
- **Estilo**: header rojo oscuro, tono de urgencia

### 6. Ticket soporte
- **Subject**: "Nuevo ticket de soporte -- Habisite"
- **Destinatario fijo**: growthimbar@gmail.com
- **Contenido**: nombre, DNI, mensaje del usuario

## Seguridad
- Todos los valores user-supplied son escapados con `HtmlUtils.htmlEscape()` antes de interpolarse en HTML
- Metodo helper `esc()` y `fila()` con escape automatico
- Previene HTML injection / XSS en emails

## Configuracion SMTP
Variables de entorno en Railway:
- `MAIL_HOST`: smtp.resend.com
- `MAIL_PORT`: 587
- `MAIL_USERNAME`: resend
- `MAIL_PASSWORD`: (API key)
- `MAIL_FROM`: contacto@habisite.com

## Archivos clave
- `backend/.../service/impl/EmailServiceImpl.java` — todas las plantillas
- `backend/.../service/impl/BienvenidaScheduler.java` — scheduler automatico
- `backend/.../service/impl/CampanaServiceImpl.java` — logica de envio masivo
