#!/usr/bin/env bash
set -e

# Ensure nvm is available
if ! command -v nvm >/dev/null; then
  cat <<'EOF'
nvm (Node Version Manager) is required but was not found.
Install it manually and restart the terminal:
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
EOF
  exit 1
fi

# Always use Node 20
if ! command -v node >/dev/null; then
  echo "Node.js not found. Installing Node 20 with nvm..."
  nvm install 20
  nvm use 20
  exit 0
fi

ver=$(node --version | sed 's/^v//' | cut -d'.' -f1)

if [ "$ver" != "20" ]; then
  echo "Switching to Node 20 via nvm..."
  nvm install 20
  nvm use 20
else
  echo "Detected Node.js v20"
fi
