#!/usr/bin/env sh
# Download heavy GLB assets from external storage (e.g., Cloudflare R2)
# Usage: MODEL_URL=https://example.com/model.glb ./download_models.sh

set -e

TARGET_DIR="$(dirname "$0")"
MODEL_URL="${MODEL_URL:-https://example.com/model.glb}"

echo "Downloading model from $MODEL_URL..."
mkdir -p "$TARGET_DIR"
curl -L "$MODEL_URL" -o "$TARGET_DIR/model.glb"
echo "Model saved to $TARGET_DIR/model.glb"
