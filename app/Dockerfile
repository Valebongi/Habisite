# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL
ARG VITE_ADMIN_USER=admin
ARG VITE_ADMIN_PASS=habisite2025
ARG VITE_JURADO_PASS=jurado2025
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ADMIN_USER=$VITE_ADMIN_USER
ENV VITE_ADMIN_PASS=$VITE_ADMIN_PASS
ENV VITE_JURADO_PASS=$VITE_JURADO_PASS

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Entrypoint: reemplaza $PORT en la config de nginx al arrancar
RUN printf '#!/bin/sh\n\
PORT=${PORT:-80}\n\
sed -i "s/__PORT__/$PORT/g" /etc/nginx/conf.d/default.conf\n\
nginx -g "daemon off;"\n' > /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

RUN printf 'server {\n  listen __PORT__;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["/docker-entrypoint.sh"]
