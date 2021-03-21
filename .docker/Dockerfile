FROM node:14.10.1-alpine3.12

WORKDIR /app

COPY [".docker/node_modules","node_modules/"]
COPY ["package.json","package.json"]
COPY ["dist","dist/"]

ENTRYPOINT [ "node", "." ]