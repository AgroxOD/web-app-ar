#!/usr/bin/env sh
# Simple helper to run a local development server.
# Automatically downloads the model if it is missing.

set -e

if [ ! -f assets/model.glb ]; then
    echo "assets/model.glb not found. Attempting download..."
    ./assets/download_models.sh
fi

echo "Starting server at http://localhost:8000"
python3 -m http.server 8000
