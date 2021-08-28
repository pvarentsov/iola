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
RUN export APP_VERSION=$(node -p "require('./package.json').version") && cd /out && \
    zip -r -j "iola-linux-amd64.zip" ./linux-amd64/ && \
    zip -r -j "iola-win-amd64.zip" ./win-amd64/ && \
    zip -r -j "iola-macos-amd64.zip" ./macos-amd64/ && \
    tar -czf "iola-macos-amd64.tar.gz" -C ./macos-amd64/ . && \
    sha256sum "iola-linux-amd64.zip" > "iola-linux-amd64.zip.sha256.txt" && \
    sha256sum "iola-win-amd64.zip" > "iola-win-amd64.zip.sha256.txt" && \
    sha256sum "iola-macos-amd64.zip" > "iola-macos-amd64.zip.sha256.txt" && \
    sha256sum "iola-macos-amd64.tar.gz" > "iola-macos-amd64.tar.gz.sha256.txt"
RUN mkdir /out/zip && mv /out/*.zip /out/zip/ && mv /out/*.tar.gz /out/zip/ && mv /out/*.sha256.txt /out/zip/

FROM scratch as app-amd64
COPY --from=bin-amd64 /out/zip /
