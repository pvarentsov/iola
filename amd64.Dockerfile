FROM --platform=linux/amd64 node:14-alpine as build
WORKDIR /app
COPY . .
RUN apk add zip && \
    npm install && \
    npm run build

FROM build as bin-amd64
RUN npm install pkg -g && \
    pkg -t node14-linux-x64 ./dist/index.js -o /out/linux-amd64/iola && \
    pkg -t node14-win-x64 ./dist/index.js -o /out/win-amd64/iola.exe && \
    pkg -t node14-macos-x64 ./dist/index.js -o /out/macos-amd64/iola
RUN zip -r -j /out/linux-amd64 /out/linux-amd64/ && \
    zip -r -j /out/win-amd64 /out/win-amd64/ && \
    zip -r -j /out/macos-amd64 /out/macos-amd64/
RUN mkdir /out/zip && mv /out/*.zip /out/zip/

FROM scratch as app-amd64
COPY --from=bin-amd64 /out/zip /
