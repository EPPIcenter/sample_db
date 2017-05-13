#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BUILD="$DIR"/build/app
DB_BUILD_DIR="$BUILD"/db-server
APP_BUILD_DIR="$BUILD"/db-app
DB_SRC_DIR="$DIR"/src/sample-db-py
APP_SRC_DIR="$DIR"/src/sample-db-app
ELECTRON_SRC_DIR="$DIR"/src/electron
DARWIN_ELECTRON_BUILD_DIR="$DIR"/build/SampleDB-darwin/SampleDB.app/Contents/Resources/app

mkdir -p "$DB_BUILD_DIR"
mkdir -p "$APP_BUILD_DIR"

rm -r "$DB_BUILD_DIR"/*
rm -r "$APP_BUILD_DIR"/*

echo "Building Application..."

"$DB_SRC_DIR"/build.sh &
"$APP_SRC_DIR"/build.sh &
wait

cp -R "$DB_SRC_DIR"/dist/ "$DB_BUILD_DIR"
cp -R "$APP_SRC_DIR"/dist/ "$APP_BUILD_DIR"
cp -R "$ELECTRON_SRC_DIR"/ "$BUILD"

rm -r "$DARWIN_ELECTRON_BUILD_DIR" && cp -R "$BUILD" "$DARWIN_ELECTRON_BUILD_DIR"

echo "Build Complete"