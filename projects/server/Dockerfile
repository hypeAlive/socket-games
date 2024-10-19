FROM node:18.20.2-alpine AS build

RUN apk add --no-cache git

# install types
COPY /types/ /app/types/

WORKDIR /app/types
RUN npm i
RUN npm run build

# install socket server
WORKDIR /app/server
COPY /server/package.json /app/server
RUN npm i
COPY /server/src /app/server/src
COPY /server/*.json /app/server/

RUN npm run build

FROM node:alpine

COPY --from=build /app/server/dist /app/server/dist
COPY --from=build /app/server/package.json /app/server
COPY --from=build /app/types/dist /app/types/dist
COPY --from=build /app/types/package.json /app/types
COPY --from=build /app/server/node_modules /app/server/node_modules


WORKDIR /app/server

CMD ["node", "dist/src/main/main.js"]
