# Dockerfile - Répertoire Libertaire CNT-AIT
FROM nginx:alpine

# Copy web application files into Nginx html directory
COPY index.html /usr/share/nginx/html/index.html
COPY styles.css /usr/share/nginx/html/styles.css
COPY cnt_ait_logo.png /usr/share/nginx/html/cnt_ait_logo.png
COPY logo_fa.svg /usr/share/nginx/html/logo_fa.svg
COPY logo_ucl.svg /usr/share/nginx/html/logo_ucl.svg
COPY logo_cnt.svg /usr/share/nginx/html/logo_cnt.svg
COPY logo_cnt_so.jpg /usr/share/nginx/html/logo_cnt_so.jpg
COPY favicon.png /usr/share/nginx/html/favicon.png
COPY favicon.ico /usr/share/nginx/html/favicon.ico
COPY document_sections_groupes_libertaires_CNT_AIT.pdf /usr/share/nginx/html/document_sections_groupes_libertaires_CNT_AIT.pdf
COPY entries.json /usr/share/nginx/html/entries.json
COPY data.js /usr/share/nginx/html/data.js
COPY vendor /usr/share/nginx/html/vendor

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
