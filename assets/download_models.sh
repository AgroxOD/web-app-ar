#!/usr/bin/env sh
# Download heavy GLB assets from external storage (for example Cloudflare R2).
#
# Usage:
#   MODEL_URL=https://example.com/model.glb ./download_models.sh
#   # or from Cloudflare R2
#   MODEL_URL=https://<account>.r2.cloudflarestorage.com/<bucket>/model.glb ./download_models.sh

set -e

if ! command -v curl >/dev/null 2>&1; then
    echo "Error: curl command not found" >&2
    exit 1
fi

TARGET_DIR="$(dirname "$0")"

if [ -z "$MODEL_URL" ]; then
    echo "Usage: MODEL_URL=<url> ./download_models.sh" >&2
    exit 1
fi

echo "Downloading model from $MODEL_URL..."
mkdir -p "$TARGET_DIR"
# Download without --fail and handle errors manually
if ! STATUS=$(curl -L -o "$TARGET_DIR/model.glb" -w "%{http_code}" "$MODEL_URL"); then
    CURL_EXIT=$?
    echo "Error: curl failed with code $CURL_EXIT" >&2
    rm -f "$TARGET_DIR/model.glb"
    exit 1
fi
if [ "$STATUS" -ne 200 ]; then
    echo "Error: failed to download model (HTTP status $STATUS)" >&2
    rm -f "$TARGET_DIR/model.glb"
    exit 1
fi
echo "Model saved to $TARGET_DIR/model.glb"
