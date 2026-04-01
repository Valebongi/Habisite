# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

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
