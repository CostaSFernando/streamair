# Site estático do Stream Air servido pelo nginx
FROM nginx:1.27-alpine
COPY index.html styles.css script.js /usr/share/nginx/html/
COPY img /usr/share/nginx/html/img
EXPOSE 80
