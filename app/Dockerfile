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
COPY nginx.template.conf /etc/nginx/conf.d/default.conf

RUN printf '#!/bin/sh\n\
PORT=${PORT:-8080}\n\
sed -i "s/__PORT__/$PORT/g" /etc/nginx/conf.d/default.conf\n\
exec nginx -g "daemon off;"\n' > /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

EXPOSE 8080
CMD ["/docker-entrypoint.sh"]
