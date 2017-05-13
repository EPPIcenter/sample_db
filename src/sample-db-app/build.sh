#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DIST="$DIR"/dist

if [ -d "$DIST" ]; then
    rm -r "$DIST"
fi

cd "$DIR"
ng build --target=production -outputPath "$DIST" --progress=false
