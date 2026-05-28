FROM nginx:alpine
COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -f /usr/share/nginx/html/Dockerfile /usr/share/nginx/html/nginx.conf
CMD sed -i "s/__PORT__/${PORT:-80}/g" /etc/nginx/conf.d/default.conf && nginx -g "daemon off;"
