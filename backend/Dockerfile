# ── Etapa 1: Build ──────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copiar pom primero para aprovechar caché de capas (dependencias)
# Las rutas son relativas al contexto de build (raíz del repo)
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B -q

COPY backend/src ./src
RUN mvn package -DskipTests -B -q

# ── Etapa 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Usuario sin privilegios
RUN addgroup -S habisite && adduser -S habisite -G habisite
USER habisite

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
