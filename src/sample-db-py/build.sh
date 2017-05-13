#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SRC="$DIR"/sample_db
BUILD="$DIR"/build
DIST="$DIR"/dist

if [ -d "$BUILD" ]; then
    rm -r "$BUILD"
fi

if [ -d "$DIST" ]; then
    rm -r "$DIST"
fi

cd "$DIR"

pip install -q -r requirements.txt
pyinstaller -y --log-level ERROR --hiddenimport email.mime.message run.py

cp -r "$SRC"/static "$DIST"/static
mkdir "$DIST"/db_backups
