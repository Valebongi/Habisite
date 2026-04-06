# Arquitectura Tecnica

## Stack

### Backend
- **Framework**: Spring Boot 3.3.5 / Java 21
- **Base de datos**: PostgreSQL (Railway)
- **ORM**: Spring Data JPA / Hibernate
- **Passwords**: BCrypt (spring-security-crypto)
- **Email**: JavaMailSender con SMTP (Resend)
- **Build**: Maven
- **Deploy**: Railway con Dockerfile (`backend/Dockerfile`)

### Frontend
- **Framework**: React 18 + TypeScript
- **UI**: Ionic 8
- **Router**: React Router v5
- **Bundler**: Vite 5
- **Deploy**: Railway con Dockerfile (`app/Dockerfile`) + nginx

### Infraestructura
- **Backend**: api.habisite.com (Railway)
- **Frontend**: concursos.habisite.com (Railway + nginx)
- **DNS**: Cloudflare
- **Base de datos**: Railway Postgres con volumen persistente

## Estructura del proyecto

```
Habisite/
  backend/
    src/main/java/com/imb/habisite/
      config/          # CorsConfig, DataSourceConfig, DataInitializer
      controller/      # REST controllers
      dto/             # Request/Response DTOs
      model/           # JPA entities
      repository/      # Spring Data repos
      service/         # Interfaces de servicio
        impl/          # Implementaciones + schedulers
      util/            # PasswordGenerator
    src/main/resources/
      application.yml  # Config principal
      schema.sql       # Migraciones de DB
    Dockerfile         # Build del backend
    pom.xml            # Dependencias Maven

  app/
    src/
      pages/
        LoginPage.tsx          # Login unificado
        RegistroPage.tsx       # Pre-registro
        ConfirmacionPage.tsx   # Formulario de confirmacion
        BajaPage.tsx           # Pagina de baja
        admin/AdminPage.tsx    # Panel admin completo
        jurado/JuradoPage.tsx  # Panel jurado completo
        postulante/PostulantePage.tsx  # Panel postulante completo
      services/api.ts          # Capa de API con interfaces
      App.tsx                  # Router principal
      main.tsx                 # Entry point
    Dockerfile                 # Build del frontend
    vite.config.ts             # Config Vite + proxy
    .env.production            # VITE_API_URL

  documentacion/               # Esta carpeta
```

## Tablas de la base de datos

| Tabla | Descripcion |
|-------|-------------|
| postulante | Participantes del concurso |
| usuario | Admins y jurados |
| concurso | Concursos/desafios |
| resolucion | Entregas/propuestas |
| resolucion_miembro | Miembros de entrega grupal |
| equipo | Relacion postulante-companero |
| evaluacion | Evaluaciones del jurado |
| criterio_evaluacion | Criterios dinamicos por concurso |
| evaluacion_criterio | Puntaje por criterio |
| soporte_ticket | Tickets de soporte |
| publicacion | Publicaciones (legacy) |
| recurso | Recursos/imagenes (legacy) |

## Autenticacion
- **Actual**: Sin autenticacion server-side (solo BCrypt para passwords)
- El login valida credenciales pero no genera token/sesion
- La "auth" es client-side (sessionStorage/localStorage)
- **Pendiente**: Implementar JWT o Spring Security completo

## Variables de entorno (Railway)

### Backend
| Variable | Descripcion |
|----------|-------------|
| DATABASE_URL | Connection string de Postgres |
| MAIL_HOST | Servidor SMTP |
| MAIL_PORT | Puerto SMTP |
| MAIL_USERNAME | Usuario SMTP |
| MAIL_PASSWORD | Password SMTP |
| MAIL_FROM | Remitente de emails |
| ADMIN_SEED_PASS | Contrasena del admin seed (opcional) |
| JURADO_SEED_PASS | Contrasena del jurado seed (opcional) |

### Frontend
| Variable | Descripcion |
|----------|-------------|
| VITE_API_URL | URL base de la API |

## Seguridad implementada
- CORS restringido a concursos.habisite.com y localhost
- Content-Type allowlist en descargas de archivos
- Content-Disposition: attachment (no inline)
- X-Content-Type-Options: nosniff
- HTML escape en todos los emails (HtmlUtils.htmlEscape)
- Credenciales del seed configurables via env vars
- Sin credenciales hardcodeadas en Dockerfile

## Seguridad pendiente
- Implementar Spring Security con JWT
- Proteger endpoints admin con @PreAuthorize
- IDOR checks en endpoints de postulante
- Rate limiting en login y registro
