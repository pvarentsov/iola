#!/usr/bin/env bash

SCRIPT_DIR=$(
  cd $(dirname "$0")
  pwd
)

cd "$SCRIPT_DIR"

APP_VERSION=$(node -p "require('./package.json').version")

pkg -t node14-macos-arm64 ./dist/index.js -o ./bin/macos-arm64/iola
pkg -t node14-macos-x64   ./dist/index.js -o ./bin/macos-x64/iola
pkg -t node14-win-x64     ./dist/index.js -o ./bin/win-x64/iola
pkg -t node14-linux-x64   ./dist/index.js -o ./bin/linux-x64/iola

cd ./bin

zip -r -j "iola-v${APP_VERSION}-macos-arm64.zip" ./macos-arm64/
zip -r -j "iola-v${APP_VERSION}-macos-x64.zip"   ./macos-x64/
zip -r -j "iola-v${APP_VERSION}-win-x64.zip"     ./win-x64/
zip -r -j "iola-v${APP_VERSION}-linux-x64.zip"   ./linux-x64/

sha256sum "iola-v${APP_VERSION}-macos-arm64.zip" > "iola-v${APP_VERSION}-macos-arm64.zip.sha256"
sha256sum "iola-v${APP_VERSION}-macos-x64.zip"   > "iola-v${APP_VERSION}-macos-x64.zip.sha256"
sha256sum "iola-v${APP_VERSION}-win-x64.zip"     > "iola-v${APP_VERSION}-win-x64.zip.sha256"
sha256sum "iola-v${APP_VERSION}-linux-x64.zip"   > "iola-v${APP_VERSION}-linux-x64.zip.sha256"

rm -r ./macos-arm64
rm -r ./macos-x64
rm -r ./win-x64
rm -r ./linux-x64

cd "$SCRIPT_DIR"