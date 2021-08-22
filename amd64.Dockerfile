FROM --platform=linux/amd64 node:14-alpine as build
WORKDIR /app
COPY . .
RUN npm install && \
    npm run build

FROM build as bin-amd64
RUN npm install pkg -g && \
    pkg -t node14-linux-x64,node14-win-x64,node14-macos-x64 ./dist/index.js -o /out/iola

FROM scratch as app-amd64
COPY --from=bin-amd64 /out /
