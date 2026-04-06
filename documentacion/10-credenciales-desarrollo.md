# Credenciales de Desarrollo

## Login (concursos.habisite.com)

| Rol | Usuario | Contrasena |
|-----|---------|------------|
| Admin | admin | habisite2025 |
| Jurado | jurado | jurado2025 |
| Postulante (prueba) | 12345678 | Test2026! |

> En produccion, cambiar las contrasenas seteando `ADMIN_SEED_PASS` y `JURADO_SEED_PASS` como variables de entorno en Railway.

## URLs

| Servicio | URL |
|----------|-----|
| Frontend | https://concursos.habisite.com |
| Backend API | https://api.habisite.com/api/v1 |
| Health check | https://api.habisite.com/api/actuator/health |

## Desarrollo local

### Frontend
```bash
cd app
npm install
npm run dev
# Corre en http://localhost:5173
# Proxy /api -> http://localhost:8080
```

### Backend
```bash
cd backend
# Con Postgres local (Docker):
docker run -d --name habisite-pg -e POSTGRES_DB=habisite -e POSTGRES_USER=habisite_user -e POSTGRES_PASSWORD=habisite_pass -p 5432:5432 postgres:16

mvn spring-boot:run
# Corre en http://localhost:8080/api
```

### Conectar a Railway Postgres desde local
```bash
DATABASE_URL="postgresql://postgres:<password>@autorack.proxy.rlwy.net:<port>/railway?sslmode=disable" mvn spring-boot:run
```
> Nota: la conexion a Railway Postgres desde local puede fallar por SSL. Se recomienda usar Postgres local con Docker.

## Repositorio
- GitHub: Valebongi/Habisite
- Branch principal: main
- Branch desarrollo: martin-dev
