#!/bin/bash
set -e

echo "Attempting to activate Node.js 20..."

# Source asdf, if available (Cloudflare Pages uses asdf)
# Use the full path for asdf.sh as it's not always in PATH initially
. "$HOME/.asdf/asdf.sh" || true

# Install and switch to Node.js 20.11.1
# Using || true to prevent script from failing if asdf commands aren't found or fail
asdf install nodejs 20.11.1 || true
asdf global nodejs 20.11.1 || true

# Verify the Node.js and npm versions after asdf commands
echo "Node.js version after asdf commands:"
node -v
echo "npm version after asdf commands:"
npm -v

# Установка зависимостей
echo "Running npm ci..."
npm ci

# Сборка проекта
echo "Running npm run build..."
npm run build

# Проверка наличия собранных файлов
if [ ! -d "dist" ]; then
    echo "Error: Build failed - dist directory not found"
    exit 1
fi

echo "Build completed successfully" 