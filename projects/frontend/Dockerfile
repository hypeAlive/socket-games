FROM node:18.20.2-alpine AS build

# install types
COPY /types/ /app/types/

WORKDIR /app/types
RUN npm i
RUN npm run build

# install socket frontend
WORKDIR /app/frontend
COPY /frontend/package.json /app/frontend
RUN npm i

COPY /frontend/public  /app/frontend/public
COPY /frontend/src  /app/frontend/src
COPY /frontend/*.json /frontend/*.js  /app/frontend/

# build frontend
WORKDIR /app/frontend
RUN npm run build

# gen nginx config
RUN npm run generate:nginx-config

FROM nginx:alpine

RUN mkdir -p /etc/nginx/ssl

COPY --from=build /app/frontend/dist/frontend/browser /usr/share/nginx/html

COPY --from=build /app/frontend/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/frontend/default.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
